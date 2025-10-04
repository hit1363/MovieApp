export interface Movie {
  id: number;
  title: string;
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

export interface TrendingMovie {
  searchTerm: string;
  movie_id: number;
  title: string;
  count: number;
  poster_url: string;
}

export interface MovieDetails {
  adult: boolean;
  backdrop_path: string | null;
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string;
    backdrop_path: string;
  } | null;
  budget: number;
  genres: {
    id: number;
    name: string;
  }[];
  homepage: string | null;
  id: number;
  imdb_id: string | null;
  original_language: string;
  original_title: string;
  overview: string | null;
  popularity: number;
  poster_path: string | null;
  production_companies: {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }[];
  production_countries: {
    iso_3166_1: string;
    name: string;
  }[];
  release_date: string;
  revenue: number;
  runtime: number | null;
  spoken_languages: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
  status: string;
  tagline: string | null;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

export interface TVShow {
  id: number;
  name: string;
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  origin_country: string[];
}

export interface TrendingTVShow {
  searchTerm: string;
  tv_id: number;
  name: string;
  count: number;
  poster_url: string;
}

export interface TVShowDetails {
  adult: boolean;
  backdrop_path: string | null;
  created_by: {
    id: number;
    credit_id: string;
    name: string;
    gender: number;
    profile_path: string | null;
  }[];
  episode_run_time: number[];
  first_air_date: string;
  genres: {
    id: number;
    name: string;
  }[];
  homepage: string;
  id: number;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: {
    id: number;
    name: string;
    overview: string;
    vote_average: number;
    vote_count: number;
    air_date: string;
    episode_number: number;
    season_number: number;
    still_path: string | null;
  } | null;
  name: string;
  networks: {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }[];
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  production_companies: {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }[];
  production_countries: {
    iso_3166_1: string;
    name: string;
  }[];
  seasons: {
    air_date: string;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    season_number: number;
  }[];
  spoken_languages: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
  status: string;
  tagline: string;
  type: string;
  vote_average: number;
  vote_count: number;
}

export interface TrendingCardProps {
  movie: TrendingMovie;
  index: number;
  type?: 'movie' | 'tv'; // Add optional type parameter
}

export interface Video {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

export interface VideoResponse {
  id: number;
  results: Video[];
}

export interface WatchProviderRegion {
  iso_3166_1: string;
  english_name: string;
  native_name: string;
}

export interface WatchProvider {
  display_priority: number;
  logo_path: string;
  provider_id: number;
  provider_name: string;
}

export interface WatchProviderOptions {
  flatrate?: WatchProvider[];
  buy?: WatchProvider[];
  rent?: WatchProvider[];
  ads?: WatchProvider[];
}

export interface WatchProviderData {
  link: string;
  flatrate?: WatchProvider[];
  buy?: WatchProvider[];
  rent?: WatchProvider[];
  ads?: WatchProvider[];
}

export interface WatchProviderResponse {
  id: number;
  results: {
    [countryCode: string]: WatchProviderData;
  };
}

// Video embed interfaces
export interface VideoEmbedOptions {
  // Player display options
  width?: string;
  height?: string;
  allowFullscreen?: boolean;
  
  // URL parameters for video player control
  color?: string;           // Primary color (hex without #)
  autoPlay?: boolean;       // Enable auto-play feature
  nextEpisode?: boolean;    // Show next episode button (TV only)
  episodeSelector?: boolean; // Enable episode selection menu (TV only)
  progress?: number;        // Start time in seconds
}

export interface MovieEmbedData {
  tmdbId: number;
  embedUrl: string;
  type: 'movie';
  options?: VideoEmbedOptions;
}

export interface TVEmbedData {
  tmdbId: number;
  season: number;
  episode: number;
  embedUrl: string;
  type: 'tv';
  options?: VideoEmbedOptions;
}

export interface EmbedUrlParams {
  tmdbId: number;
  season?: number;
  episode?: number;
  mediaType: 'movie' | 'tv';
}

// Player Event Interfaces for Watch Progress Tracking
export type PlayerEventType = 'timeupdate' | 'play' | 'pause' | 'ended' | 'seeked';

export interface PlayerEventData {
  event: PlayerEventType;
  currentTime: number;        // Current playback position in seconds
  duration: number;           // Total duration in seconds
  progress: number;           // Watch progress percentage
  id: string;                 // Content ID (TMDB ID as string)
  mediaType: 'movie' | 'tv';  // Content type
  season?: number;            // Season number (for TV shows)
  episode?: number;           // Episode number (for TV shows)
  timestamp: number;          // Event timestamp
}

export interface PlayerMessage {
  type: 'PLAYER_EVENT';
  data: PlayerEventData;
}

// Watch Progress Storage Interfaces
export interface WatchProgress {
  id: string;                 // Content identifier
  mediaType: 'movie' | 'tv';
  tmdbId: number;
  title?: string;             // Content title for display
  season?: number;            // For TV shows
  episode?: number;           // For TV shows
  currentTime: number;        // Last watched position in seconds
  duration: number;           // Total duration in seconds
  progress: number;           // Progress percentage (0-100)
  lastWatched: number;        // Timestamp of last watch
  completed: boolean;         // Whether content was fully watched
}

export interface WatchProgressStorage {
  [contentId: string]: WatchProgress;
}

// Progress Event Handlers
export interface ProgressEventHandlers {
  onPlay?: (data: PlayerEventData) => void;
  onPause?: (data: PlayerEventData) => void;
  onTimeUpdate?: (data: PlayerEventData) => void;
  onEnded?: (data: PlayerEventData) => void;
  onSeeked?: (data: PlayerEventData) => void;
}

// Progress Tracking Configuration
export interface ProgressTrackingConfig {
  enableLocalStorage?: boolean;
  enableConsoleLogging?: boolean;
  saveInterval?: number;      // Save progress every N seconds
  completionThreshold?: number; // Consider completed at N% (default 90)
  customSaveFunction?: (progress: WatchProgress) => Promise<void>;
  customLoadFunction?: (contentId: string) => Promise<WatchProgress | null>;
}
