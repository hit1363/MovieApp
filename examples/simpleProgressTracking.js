/**
 * MovieApp Progress Tracking with VidKing Player Integration
 * 
 * This file demonstrates how to integrate VidKing video players with progress tracking
 * for both movies and TV series. Copy this script to your website to start tracking
 * video progress automatically.
 * 
 * USAGE EXAMPLES:
 * 
 * 1. Basic Movie Player:
 * <iframe 
 *   src="https://www.vidking.net/embed/movie/1078605" 
 *   width="100%" 
 *   height="600" 
 *   frameborder="0" 
 *   allowfullscreen>
 * </iframe>
 * 
 * 2. TV Series with All Features:
 * <iframe 
 *   src="https://www.vidking.net/embed/tv/119051/1/8?color=e50914&autoPlay=true&nextEpisode=true&episodeSelector=true" 
 *   width="100%" 
 *   height="600" 
 *   frameborder="0" 
 *   allowfullscreen>
 * </iframe>
 * 
 * 3. Custom Branded Player:
 * <iframe 
 *   src="https://www.vidking.net/embed/movie/1078605?color=9146ff&autoPlay=true" 
 *   width="100%" 
 *   height="600" 
 *   frameborder="0" 
 *   allowfullscreen>
 * </iframe>
 * 
 * 4. Player with Start Time (Resume Progress):
 * <iframe 
 *   src="https://www.vidking.net/embed/movie/1078605?color=e50914&progress=120&autoPlay=true" 
 *   width="100%" 
 *   height="600" 
 *   frameborder="0" 
 *   allowfullscreen>
 * </iframe>
 * 
 * FEATURES:
 * - Automatic progress tracking for movies and TV episodes
 * - Resume watching from last position
 * - Local storage persistence
 * - Real-time progress updates
 * - Continue watching list management
 * - Custom branding support
 * 
 * SETUP:
 * 1. Include this script in your HTML page
 * 2. Add the HTML containers for progress display (optional)
 * 3. The script will automatically track progress from any VidKing player
 */

// Enhanced message listener with better error handling
window.addEventListener("message", function (event) {
  // Validate event origin for security (optional - uncomment if needed)
  // if (!event.origin.includes('vidking.net')) return;
  
  if (typeof event.data === "string") {
    try {
      const message = JSON.parse(event.data);
      
      if (message.type === "PLAYER_EVENT" && message.data) {
        const data = message.data;
        
        // Validate required data fields
        if (!data.event || typeof data.currentTime !== 'number' || typeof data.duration !== 'number') {
          console.warn("Invalid player event data:", data);
          return;
        }
        
        console.log("Player event received:", data.event, {
          time: `${Math.floor(data.currentTime)}s`,
          progress: `${(data.progress || 0).toFixed(1)}%`,
          id: data.id
        });
        
        // Display message in DOM element (if exists)
        const messageArea = document.querySelector("#messageArea");
        if (messageArea) {
          messageArea.innerText = JSON.stringify(data, null, 2);
        }
        
        // Handle different events
        switch (data.event) {
          case 'timeupdate':
            handleTimeUpdate(data);
            break;
          case 'play':
            handlePlay(data);
            break;
          case 'pause':
            handlePause(data);
            break;
          case 'ended':
            handleEnded(data);
            break;
          case 'seeked':
            handleSeeked(data);
            break;
          default:
            console.log("Unhandled player event:", data.event);
        }
      }
    } catch (error) {
      console.error("Failed to parse player message:", error, "Data:", event.data);
    }
  }
});

// Enhanced event handlers with validation
function handleTimeUpdate(data) {
  if (!data || typeof data.currentTime !== 'number' || typeof data.duration !== 'number') {
    return;
  }
  
  // Calculate progress if not provided
  if (typeof data.progress !== 'number') {
    data.progress = (data.currentTime / data.duration) * 100;
  }
  
  // Save progress periodically (every 10 seconds) and avoid saving at 0
  if (data.currentTime > 0 && Math.floor(data.currentTime) % 10 === 0) {
    saveProgress(data);
  }
  
  // Update progress display
  updateProgressDisplay(data);
}

function handlePlay(data) {
  console.log("🎬 Video started playing", {
    id: data.id,
    time: `${Math.floor(data.currentTime || 0)}s`,
    mediaType: data.mediaType
  });
  updatePlayerState("playing");
}

function handlePause(data) {
  console.log("⏸️ Video paused", {
    id: data.id,
    time: `${Math.floor(data.currentTime || 0)}s`,
    progress: `${(data.progress || 0).toFixed(1)}%`
  });
  
  // Always save progress on pause (if we have valid data)
  if (data && data.currentTime > 0) {
    saveProgress(data);
  }
  updatePlayerState("paused");
}

function handleEnded(data) {
  console.log("🏁 Video ended", {
    id: data.id,
    duration: `${Math.floor(data.duration || 0)}s`,
    mediaType: data.mediaType
  });
  markAsComplete(data);
  updatePlayerState("ended");
}

function handleSeeked(data) {
  console.log("⏭️ User seeked", {
    id: data.id,
    newTime: `${Math.floor(data.currentTime || 0)}s`,
    progress: `${(data.progress || 0).toFixed(1)}%`
  });
}

// Enhanced progress storage functions with validation
function saveProgress(data) {
  if (!data || !data.id || typeof data.currentTime !== 'number' || typeof data.duration !== 'number') {
    console.warn("Cannot save progress: Invalid data", data);
    return;
  }
  
  // Don't save if current time is 0 or negative
  if (data.currentTime <= 0) {
    return;
  }
  
  try {
    const contentId = generateContentId(data.id, data.season, data.episode);
    
    // Calculate progress if not provided
    const progress = data.progress || (data.currentTime / data.duration) * 100;
    
    const progressData = {
      id: contentId,
      mediaType: data.mediaType || 'movie',
      tmdbId: data.id,
      season: data.season,
      episode: data.episode,
      currentTime: Math.floor(data.currentTime),
      duration: Math.floor(data.duration),
      progress: Math.min(100, Math.max(0, progress)), // Clamp between 0-100
      lastWatched: Date.now(),
      completed: false
    };
    
    // Save to localStorage with error handling
    localStorage.setItem(`movieapp_progress_${contentId}`, JSON.stringify(progressData));
    
    console.log("💾 Progress saved:", {
      id: contentId,
      progress: `${progressData.progress.toFixed(1)}%`,
      time: `${progressData.currentTime}s`
    });
  } catch (error) {
    console.error("Failed to save progress:", error);
  }
}

function markAsComplete(data) {
  if (!data || !data.id) {
    console.warn("Cannot mark as complete: Invalid data", data);
    return;
  }
  
  try {
    const contentId = generateContentId(data.id, data.season, data.episode);
    const existingProgress = localStorage.getItem(`movieapp_progress_${contentId}`);
    
    if (existingProgress) {
      const progress = JSON.parse(existingProgress);
      progress.completed = true;
      progress.progress = 100;
      progress.currentTime = Math.floor(data.duration || progress.duration);
      progress.lastWatched = Date.now();
      
      localStorage.setItem(`movieapp_progress_${contentId}`, JSON.stringify(progress));
      console.log("✅ Marked as complete:", {
        id: contentId,
        duration: `${progress.currentTime}s`
      });
    }
  } catch (error) {
    console.error("Failed to mark as complete:", error);
  }
}

function generateContentId(tmdbId, season, episode) {
  if (season !== undefined && episode !== undefined) {
    return `tv_${tmdbId}_s${season}e${episode}`;
  }
  return `movie_${tmdbId}`;
}

// UI update functions
function updateProgressDisplay(data) {
  const progressElement = document.querySelector("#progressDisplay");
  if (progressElement) {
    const timeStr = formatTime(data.currentTime);
    const durationStr = formatTime(data.duration);
    
    progressElement.innerHTML = `
      <div class="progress-info">
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${data.progress}%"></div>
        </div>
        <div class="progress-text">
          ${data.progress.toFixed(1)}% - ${timeStr} / ${durationStr}
        </div>
      </div>
    `;
  }
}

function updatePlayerState(state) {
  const stateElement = document.querySelector("#playerState");
  if (stateElement) {
    stateElement.textContent = `Player State: ${state}`;
    stateElement.className = `player-state ${state}`;
  }
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Utility functions for retrieving saved progress
function getProgress(tmdbId, season, episode) {
  const contentId = generateContentId(tmdbId, season, episode);
  const stored = localStorage.getItem(`movieapp_progress_${contentId}`);
  return stored ? JSON.parse(stored) : null;
}

function getAllProgress() {
  const allProgress = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('movieapp_progress_')) {
      const progress = JSON.parse(localStorage.getItem(key));
      allProgress.push(progress);
    }
  }
  return allProgress.sort((a, b) => b.lastWatched - a.lastWatched);
}

function getContinueWatching() {
  return getAllProgress().filter(progress => 
    !progress.completed && progress.progress > 5
  );
}

function clearProgress(tmdbId, season, episode) {
  const contentId = generateContentId(tmdbId, season, episode);
  localStorage.removeItem(`movieapp_progress_${contentId}`);
}

// ===== PLAYER CREATION AND MANAGEMENT FUNCTIONS =====

/**
 * Create a VidKing player iframe with progress tracking
 * @param {Object} config - Player configuration
 * @param {string|number} config.id - TMDB movie/TV show ID
 * @param {string} config.type - 'movie' or 'tv'
 * @param {number} [config.season] - Season number (for TV shows)
 * @param {number} [config.episode] - Episode number (for TV shows)
 * @param {string} [config.color] - Custom brand color (hex without #)
 * @param {boolean} [config.autoPlay] - Enable autoplay
 * @param {boolean} [config.nextEpisode] - Enable next episode (TV only)
 * @param {boolean} [config.episodeSelector] - Enable episode selector (TV only)
 * @param {number} [config.startTime] - Start time in seconds
 * @param {string} [config.width] - Player width (default: 100%)
 * @param {string} [config.height] - Player height (default: 600px)
 * @param {string} [config.containerId] - ID of container element
 * @returns {HTMLIFrameElement} The created iframe element
 */
function createPlayer(config) {
  if (!config || !config.id || !config.type) {
    throw new Error("Player config must include id and type (movie/tv)");
  }
  
  // Build base URL
  let url;
  if (config.type === 'movie') {
    url = `https://www.vidking.net/embed/movie/${config.id}`;
  } else if (config.type === 'tv') {
    if (!config.season || !config.episode) {
      throw new Error("TV shows require season and episode numbers");
    }
    url = `https://www.vidking.net/embed/tv/${config.id}/${config.season}/${config.episode}`;
  } else {
    throw new Error("Type must be 'movie' or 'tv'");
  }
  
  // Build query parameters
  const params = new URLSearchParams();
  
  if (config.color) {
    params.append('color', config.color.replace('#', ''));
  }
  
  if (config.autoPlay) {
    params.append('autoPlay', 'true');
  }
  
  if (config.type === 'tv') {
    if (config.nextEpisode) {
      params.append('nextEpisode', 'true');
    }
    if (config.episodeSelector) {
      params.append('episodeSelector', 'true');
    }
  }
  
  if (config.startTime && config.startTime > 0) {
    params.append('progress', config.startTime.toString());
  }
  
  // Add parameters to URL
  if (params.toString()) {
    url += '?' + params.toString();
  }
  
  // Create iframe element
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.width = config.width || '100%';
  iframe.height = config.height || '600';
  iframe.frameBorder = '0';
  iframe.allowFullscreen = true;
  iframe.setAttribute('allowfullscreen', '');
  
  // Add to container if specified
  if (config.containerId) {
    const container = document.getElementById(config.containerId);
    if (container) {
      container.appendChild(iframe);
    } else {
      console.warn(`Container with id '${config.containerId}' not found`);
    }
  }
  
  console.log("🎬 Player created:", {
    type: config.type,
    id: config.id,
    url: url
  });
  
  return iframe;
}

/**
 * Create a movie player with resume functionality
 * Automatically resumes from saved progress if available
 */
function createMoviePlayer(movieId, options = {}) {
  const existingProgress = getProgress(movieId);
  
  const config = {
    id: movieId,
    type: 'movie',
    color: options.color || 'e50914',
    autoPlay: options.autoPlay !== false, // Default to true
    width: options.width,
    height: options.height,
    containerId: options.containerId,
    ...options
  };
  
  // Resume from saved progress if available and not completed
  if (existingProgress && !existingProgress.completed && existingProgress.currentTime > 30) {
    config.startTime = existingProgress.currentTime;
    console.log(`🔄 Resuming movie ${movieId} from ${formatTime(existingProgress.currentTime)}`);
  }
  
  return createPlayer(config);
}

/**
 * Create a TV show player with resume functionality
 */
function createTVPlayer(showId, season, episode, options = {}) {
  const existingProgress = getProgress(showId, season, episode);
  
  const config = {
    id: showId,
    type: 'tv',
    season: season,
    episode: episode,
    color: options.color || 'e50914',
    autoPlay: options.autoPlay !== false,
    nextEpisode: options.nextEpisode !== false,
    episodeSelector: options.episodeSelector !== false,
    width: options.width,
    height: options.height,
    containerId: options.containerId,
    ...options
  };
  
  // Resume from saved progress if available and not completed
  if (existingProgress && !existingProgress.completed && existingProgress.currentTime > 30) {
    config.startTime = existingProgress.currentTime;
    console.log(`🔄 Resuming S${season}E${episode} from ${formatTime(existingProgress.currentTime)}`);
  }
  
  return createPlayer(config);
}

/**
 * Create a continue watching section in the DOM
 * @param {string} containerId - ID of the container element
 * @param {Object} options - Display options
 */
function createContinueWatchingSection(containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id '${containerId}' not found`);
    return;
  }
  
  const continueWatching = getContinueWatching();
  
  if (continueWatching.length === 0) {
    container.innerHTML = '<p>No items to continue watching</p>';
    return;
  }
  
  let html = '<div class="continue-watching"><h3>Continue Watching</h3>';
  
  continueWatching.forEach(item => {
    const isTV = item.mediaType === 'tv';
    const title = isTV ? `Show ${item.tmdbId} - S${item.season}E${item.episode}` : `Movie ${item.tmdbId}`;
    
    html += `
      <div class="continue-item" data-content-id="${item.id}">
        <div class="continue-info">
          <h4>${title}</h4>
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${item.progress}%"></div>
          </div>
          <p>${item.progress.toFixed(1)}% watched • ${formatTime(item.duration - item.currentTime)} remaining</p>
        </div>
        <div class="continue-actions">
          <button onclick="resumeWatching('${item.id}')" class="resume-btn">Resume</button>
          <button onclick="removeFromContinueWatching('${item.id}')" class="remove-btn">Remove</button>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

/**
 * Resume watching from continue watching list
 */
function resumeWatching(contentId) {
  const progressData = getAllProgress().find(p => p.id === contentId);
  if (!progressData) {
    console.error('Progress data not found for:', contentId);
    return;
  }
  
  const config = {
    color: 'e50914',
    autoPlay: true,
    startTime: progressData.currentTime
  };
  
  if (progressData.mediaType === 'tv') {
    createTVPlayer(progressData.tmdbId, progressData.season, progressData.episode, config);
  } else {
    createMoviePlayer(progressData.tmdbId, config);
  }
}

/**
 * Remove item from continue watching
 */
function removeFromContinueWatching(contentId) {
  const parts = contentId.split('_');
  if (parts.length >= 2) {
    const tmdbId = parts[1];
    if (parts[0] === 'tv' && parts.length === 4) {
      const season = parseInt(parts[2].substring(1));
      const episode = parseInt(parts[3].substring(1));
      clearProgress(tmdbId, season, episode);
    } else {
      clearProgress(tmdbId);
    }
    
    // Refresh the continue watching section
    const continueSection = document.querySelector('.continue-watching');
    if (continueSection && continueSection.parentElement) {
      createContinueWatchingSection(continueSection.parentElement.id);
    }
  }
}

// Export functions for use in other scripts
window.MovieAppProgress = {
  getProgress,
  getAllProgress,
  getContinueWatching,
  clearProgress,
  formatTime
};

console.log("🎬 MovieApp Progress Tracking initialized");
console.log("📊 Available functions:", Object.keys(window.MovieAppProgress));