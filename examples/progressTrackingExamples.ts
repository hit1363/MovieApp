// Progress Tracking Examples for MovieApp
// This file demonstrates how to implement watch progress tracking

import * as React from 'react';
import type {
    PlayerEventData,
    ProgressEventHandlers,
    ProgressTrackingConfig,
    WatchProgress
} from '../interfaces/interfaces';
import {
    generateContentId,
    getResumeProgress,
    PROGRESS_CONFIG,
    setupProgressTracking
} from '../services/api';

// ===== BASIC SETUP =====

/**
 * Basic progress tracking setup with console logging
 * Add this to your main app component or video player page
 */
export const initializeBasicProgressTracking = () => {
  const cleanup = setupProgressTracking();
  
  // Return cleanup function to call when component unmounts
  return cleanup;
};

// ===== ADVANCED SETUP WITH CUSTOM HANDLERS =====

/**
 * Advanced setup with custom event handlers
 */
export const initializeAdvancedProgressTracking = () => {
  const handlers: ProgressEventHandlers = {
    onPlay: (data: PlayerEventData) => {
      console.log('🎬 Video started playing:', {
        content: data.mediaType === 'tv' ? `S${data.season}E${data.episode}` : 'Movie',
        time: `${Math.floor(data.currentTime)}s`
      });
    },
    
    onPause: (data: PlayerEventData) => {
      console.log('⏸️ Video paused at:', {
        progress: `${data.progress.toFixed(1)}%`,
        time: `${Math.floor(data.currentTime)}s`
      });
    },
    
    onTimeUpdate: (data: PlayerEventData) => {
      // Log every 30 seconds to avoid spam
      if (Math.floor(data.currentTime) % 30 === 0) {
        console.log('⏱️ Progress update:', {
          progress: `${data.progress.toFixed(1)}%`,
          remaining: `${Math.floor(data.duration - data.currentTime)}s`
        });
      }
    },
    
    onEnded: (data: PlayerEventData) => {
      console.log('🏁 Video finished!', {
        duration: `${Math.floor(data.duration)}s`,
        content: data.mediaType === 'tv' ? `S${data.season}E${data.episode}` : 'Movie'
      });
    },
    
    onSeeked: (data: PlayerEventData) => {
      console.log('⏭️ User seeked to:', {
        time: `${Math.floor(data.currentTime)}s`,
        progress: `${data.progress.toFixed(1)}%`
      });
    }
  };
  
  const config: ProgressTrackingConfig = {
    ...PROGRESS_CONFIG,
    enableConsoleLogging: true,
    saveInterval: 15, // Save every 15 seconds
    completionThreshold: 85 // Consider completed at 85%
  };
  
  return setupProgressTracking(handlers, config);
};

// ===== BACKEND INTEGRATION EXAMPLE =====

/**
 * Example with backend API integration
 */
export const initializeBackendProgressTracking = () => {
  const config: ProgressTrackingConfig = {
    ...PROGRESS_CONFIG,
    enableLocalStorage: true, // Keep localStorage as backup
    customSaveFunction: async (progress: WatchProgress) => {
      try {
        // Replace with your actual API endpoint
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(progress)
        });
      } catch (error) {
        console.error('Failed to save progress to backend:', error);
        // LocalStorage will still work as fallback
      }
    },
    customLoadFunction: async (contentId: string) => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch(`/api/progress/${contentId}`);
        return response.ok ? await response.json() : null;
      } catch (error) {
        console.error('Failed to load progress from backend:', error);
        return null;
      }
    }
  };
  
  return setupProgressTracking(undefined, config);
};

// ===== REACT COMPONENT EXAMPLES =====

/**
 * React hook for progress tracking
 */
export const useProgressTracking = (movieId: number, season?: number, episode?: number) => {
  const [progress, setProgress] = React.useState<WatchProgress | null>(null);
  const [isTracking, setIsTracking] = React.useState(false);
  
  React.useEffect(() => {
    // Load existing progress
    const existingProgress = getResumeProgress(movieId, season, episode);
    setProgress(existingProgress);
    
    // Setup tracking
    const cleanup = setupProgressTracking({
      onTimeUpdate: (data: PlayerEventData) => {
        if (parseInt(data.id) === movieId) {
          const updatedProgress = {
            id: generateContentId(movieId, season, episode),
            mediaType: data.mediaType,
            tmdbId: movieId,
            season,
            episode,
            currentTime: data.currentTime,
            duration: data.duration,
            progress: data.progress,
            lastWatched: Date.now(),
            completed: data.progress >= 90
          };
          setProgress(updatedProgress);
        }
      }
    });
    
    setIsTracking(true);
    
    return () => {
      cleanup();
      setIsTracking(false);
    };
  }, [movieId, season, episode]);
  
  return { progress, isTracking };
};

/**
 * Continue Watching Component Example (React)
 * Note: This is a conceptual example - implement in your .tsx files
 */
export const ContinueWatchingListExample = () => {
  // This would be implemented in a .tsx file with proper React imports
  const exampleCode = `
import React from 'react';
import { getIncompleteProgress, clearWatchProgress } from '../services/api';

export const ContinueWatchingList = () => {
  const [incompleteItems, setIncompleteItems] = React.useState<WatchProgress[]>([]);
  
  React.useEffect(() => {
    const items = getIncompleteProgress();
    setIncompleteItems(items);
  }, []);
  
  const handleRemoveItem = (contentId: string) => {
    clearWatchProgress(contentId);
    setIncompleteItems(prev => prev.filter(item => item.id !== contentId));
  };
  
  return (
    <div className="continue-watching">
      <h2>Continue Watching</h2>
      {incompleteItems.map(item => (
        <div key={item.id} className="continue-item">
          <h3>{item.title || \`\${item.mediaType} \${item.tmdbId}\`}</h3>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: \`\${item.progress}%\` }}
            />
          </div>
          <p>{item.progress.toFixed(1)}% watched</p>
          <button onClick={() => handleRemoveItem(item.id)}>
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};
`;
  
  console.log('Continue Watching Component Example:', exampleCode);
};

// ===== VANILLA JAVASCRIPT EXAMPLE =====

/**
 * Complete vanilla JavaScript implementation
 */
export const vanillaProgressTracking = () => {
  // Setup message listener
  window.addEventListener("message", function (event) {
    console.log("Message received from player:", event.data);
    
    if (typeof event.data === "string") {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === "PLAYER_EVENT") {
          const data = message.data;
          
          // Handle different events
          switch (data.event) {
            case 'timeupdate':
              // Save progress every 10 seconds
              if (Math.floor(data.currentTime) % 10 === 0) {
                saveProgressToStorage(data);
              }
              break;
              
            case 'play':
              console.log('Video started playing');
              break;
              
            case 'pause':
              console.log('Video paused');
              saveProgressToStorage(data);
              break;
              
            case 'ended':
              console.log('Video ended');
              markAsCompleted(data);
              break;
              
            case 'seeked':
              console.log('User seeked video');
              break;
          }
          
          // Update UI with progress
          updateProgressUI(data);
        }
      } catch (error) {
        console.error('Failed to parse player message:', error);
      }
    }
  });
  
  function saveProgressToStorage(data: PlayerEventData) {
    const contentId = generateContentId(parseInt(data.id), data.season, data.episode);
    const progress = {
      id: contentId,
      mediaType: data.mediaType,
      tmdbId: parseInt(data.id),
      season: data.season,
      episode: data.episode,
      currentTime: data.currentTime,
      duration: data.duration,
      progress: data.progress,
      lastWatched: Date.now(),
      completed: false
    };
    
    localStorage.setItem(`progress_${contentId}`, JSON.stringify(progress));
  }
  
  function markAsCompleted(data: PlayerEventData) {
    const contentId = generateContentId(parseInt(data.id), data.season, data.episode);
    const existing = localStorage.getItem(`progress_${contentId}`);
    
    if (existing) {
      const progress = JSON.parse(existing);
      progress.completed = true;
      progress.progress = 100;
      localStorage.setItem(`progress_${contentId}`, JSON.stringify(progress));
    }
  }
  
  function updateProgressUI(data: PlayerEventData) {
    const progressElement = document.getElementById('progress-display');
    if (progressElement) {
      progressElement.innerHTML = `
        <div>Progress: ${data.progress.toFixed(1)}%</div>
        <div>Time: ${Math.floor(data.currentTime)}s / ${Math.floor(data.duration)}s</div>
        <div>Event: ${data.event}</div>
      `;
    }
  }
};

// ===== UTILITY FUNCTIONS =====

/**
 * Format time for display
 */
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Get progress percentage as readable string
 */
export const getProgressText = (progress: WatchProgress): string => {
  if (progress.completed) {
    return 'Completed';
  }
  
  if (progress.progress < 5) {
    return 'Just started';
  }
  
  return `${progress.progress.toFixed(0)}% watched`;
};

/**
 * Calculate time remaining
 */
export const getTimeRemaining = (progress: WatchProgress): string => {
  const remaining = progress.duration - progress.currentTime;
  return formatTime(remaining);
};