/**
 * Regular Player module for standard Kaltura Player API
 */
import { BasePlayer } from './player.js';
import { logMessage } from '../utils/logger.js';

/**
 * Regular Player class for standard Kaltura Player API
 * @extends BasePlayer
 */
export class RegularPlayer extends BasePlayer {
  /**
   * Create a regular player instance
   * @param {Object} config - Player configuration
   */
  constructor(config = {}) {
    super(config);
    
    // Default configuration for regular mode
    this.config = {
      targetId: 'kaltura_player',
      playback: { autoplay: false, preload: 'auto' },
      provider: { partnerId: 2421271, uiConfId: 43473121 },
      log: { level: 'ERROR', playerVersion: false },
      ...config
    };
    
    this.timelineService = null;
  }
  
  /**
   * Initialize the regular player
   * @returns {Promise} Promise that resolves when the player is ready
   */
  async initialize() {
    try {
      if (typeof KalturaPlayer === 'undefined') {
        throw new Error('KalturaPlayer is not defined. Make sure the Kaltura Player API is loaded.');
      }
      
      // Make sure any existing KalturaPlayer instances are destroyed
      if (typeof KalturaPlayer.destroy === 'function') {
        try {
          KalturaPlayer.destroy();
          logMessage('Existing KalturaPlayer instances destroyed');
        } catch (destroyError) {
          logMessage(`Warning: Error during KalturaPlayer.destroy(): ${destroyError.message}`, 'error');
        }
      }
      
      // Ensure the player container is empty
      const playerContainer = document.getElementById(this.targetId);
      if (playerContainer && playerContainer.children.length > 0) {
        logMessage('Player container not empty, clearing it');
        playerContainer.innerHTML = '';
      }
      
      // Add a small delay before setting up the new player
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Setup the player
      logMessage(`Setting up KalturaPlayer with config: ${JSON.stringify(this.config)}`);
      this.player = KalturaPlayer.setup(this.config);
      
      // Wait for player setup to stabilize
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Add a specific fix for the visibility.js error
      const updatedPlayerContainer = document.getElementById(this.targetId);
      if (updatedPlayerContainer) {
        // Create a dismissible container if it doesn't exist
        // This is to prevent the "Cannot read properties of null (reading 'querySelector')" error
        let dismissibleContainer = updatedPlayerContainer.querySelector('.playkit-player-gui');
        if (!dismissibleContainer) {
          logMessage('Creating missing dismissible container');
          dismissibleContainer = document.createElement('div');
          dismissibleContainer.className = 'playkit-player-gui';
          updatedPlayerContainer.appendChild(dismissibleContainer);
        }
      }
      
      // Wait for player to be ready before resolving
      try {
        const readyPromise = this.player.ready();
        
        // Add a timeout to prevent hanging if ready event never fires
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Player ready timeout')), 5000);
        });
        
        await Promise.race([readyPromise, timeoutPromise])
          .then(() => {
            logMessage('Regular player is ready');
          })
          .catch(err => {
            logMessage(`Warning: Player ready event error: ${err.message}`, 'error');
            // Continue anyway, as the player might still work
          });
      } catch (readyError) {
        logMessage(`Warning: Player ready event error: ${readyError.message}`, 'error');
        // Continue anyway, as the player might still work
      }
      
      // Get timeline service
      this.timelineService = this.player.getService('timeline');
      if (this.timelineService) {
        logMessage('Timeline service attached to Regular mode');
      }
      
      logMessage('Regular player initialized');
      return this.player;
    } catch (error) {
      logMessage(`Error initializing regular player: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * Play the media
   * @returns {Promise} Promise that resolves when playback starts
   */
  async play() {
    if (!this.player) return false;
    
    try {
      await this.player.play();
      logMessage('Regular player: Playback started');
      return true;
    } catch (error) {
      logMessage(`Regular player: Error starting playback: ${error.message}`, 'error');
      return false;
    }
  }
  
  /**
   * Pause the media
   */
  pause() {
    if (!this.player) return;
    
    try {
      this.player.pause();
      logMessage('Regular player: Playback paused');
    } catch (error) {
      logMessage(`Regular player: Error pausing playback: ${error.message}`, 'error');
    }
  }
  
  /**
   * Check if the player is paused
   * @returns {boolean} True if paused, false otherwise
   */
  get paused() {
    if (!this.player) return true;
    
    try {
      return this.player.paused;
    } catch (error) {
      logMessage(`Regular player: Error checking paused state: ${error.message}`, 'error');
      return true;
    }
  }
  
  /**
   * Load regular media content
   * @param {Object} mediaConfig - Media configuration with entryId
   * @returns {Promise} Promise that resolves when media is loaded
   */
  async loadMedia(mediaConfig = { entryId: '1_71gyojxl' }) {
    try {
      if (!this.player) {
        throw new Error('Player not initialized');
      }
      
      await this.player.loadMedia(mediaConfig);
      logMessage(`Regular entry (${mediaConfig.entryId}) loaded`);
      return true;
    } catch (error) {
      logMessage(`Error loading regular media: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * Attach an event listener to the regular player
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @protected
   */
  _attachEventListener(event, callback) {
    if (!this.player) return;
    
    // Regular player uses addEventListener method
    this.player.addEventListener(event, callback);
  }
  
  /**
   * Detach an event listener from the regular player
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @protected
   */
  _detachEventListener(event, callback) {
    if (!this.player) return;
    
    // Regular player uses removeEventListener method
    this.player.removeEventListener(event, callback);
  }
  
  /**
   * Override seek method for regular player
   * @param {number} time - Time in seconds
   */
  seek(time) {
    if (!this.player) return;
    
    try {
      if (typeof this.player.currentTime === 'number') {
        this.player.currentTime = time;
      } else {
        logMessage('Cannot seek: currentTime property not available', 'error');
      }
    } catch (error) {
      logMessage(`Error seeking: ${error.message}`, 'error');
    }
  }
  
  /**
   * Override setVolume method for regular player
   * @param {number} value - Volume from 0 to 1
   */
  setVolume(value) {
    if (!this.player) return;
    
    try {
      this.player.volume = Math.max(0, Math.min(1, value));
    } catch (error) {
      logMessage(`Error setting volume: ${error.message}`, 'error');
    }
  }
  
  /**
   * Override setPlaybackRate method for regular player
   * @param {number} rate - Playback rate
   */
  setPlaybackRate(rate) {
    if (!this.player) return;
    
    try {
      this.player.playbackRate = rate;
    } catch (error) {
      logMessage(`Error setting playback rate: ${error.message}`, 'error');
    }
  }
  
  /**
   * Add a diamond marker to the timeline
   * @param {number} time - Time in seconds
   * @returns {Object|null} The marker object or null if failed
   */
  addDiamondMarker(time) {
    if (!this.timelineService) {
      logMessage('Timeline service not available', 'error');
      return null;
    }
    
    try {
      const uiAPI = KalturaPlayer.ui;
      const markerObj = {
        time,
        marker: { 
          get: () => uiAPI.preact.h("div", { className: "diamond-marker" }) 
        },
        preview: { 
          get: (props) => {
            const vt = props?.defaultPreviewProps?.virtualTime;
            return uiAPI.preact.h(
              "div", 
              { className: "diamond-preview" }, 
              "Marker at " + (vt !== undefined ? vt.toFixed(1) + "s" : "N/A")
            );
          }
        }
      };
      
      const result = this.timelineService.addCuePoint(markerObj);
      if (result && result.id) {
        logMessage(`Marker added at ${time}s (id: ${result.id})`);
        return result;
      }
      return null;
    } catch (error) {
      logMessage(`Error adding marker: ${error.message}`, 'error');
      return null;
    }
  }
  
  /**
   * Add multiple diamond markers at specified times
   * @param {number[]} times - Array of times in seconds
   * @returns {Object[]} Array of marker objects
   */
  addDiamondMarkers(times) {
    return times
      .map(time => this.addDiamondMarker(time))
      .filter(marker => marker !== null);
  }
  
  /**
   * Add a chapter marker to the timeline
   * @param {number} time - Time in seconds
   * @param {string} title - Chapter title
   * @param {string} [id] - Optional chapter ID
   * @returns {Object|null} The chapter object or null if failed
   */
  addChapter(time, title, id = `chapter-${Date.now()}`) {
    if (!this.timelineService) {
      logMessage('Timeline service not available', 'error');
      return null;
    }
    
    try {
      const result = this.timelineService.addKalturaCuePoint(time, "Chapter", id, title);
      logMessage(`Chapter added at ${time.toFixed(1)}s (id: ${id})`);
      return result;
    } catch (error) {
      logMessage(`Error adding chapter: ${error.message}`, 'error');
      return null;
    }
  }
  
  /**
   * Add multiple chapters at specified times
   * @param {Array<{time: number, title: string, id?: string}>} chapters - Array of chapter objects
   * @returns {Object[]} Array of chapter objects
   */
  addChapters(chapters) {
    return chapters
      .map(chapter => this.addChapter(chapter.time, chapter.title, chapter.id))
      .filter(chapter => chapter !== null);
  }
  
  /**
   * Clear all timeline markers and chapters
   */
  clearTimeline() {
    if (!this.timelineService) {
      logMessage('Timeline service not available', 'error');
      return;
    }
    
    try {
      this.timelineService.reset();
      this.timelineService.loadMedia();
      logMessage('Timeline cleared');
    } catch (error) {
      logMessage(`Error clearing timeline: ${error.message}`, 'error');
    }
  }
  
  /**
   * Attach default regular player event listeners
   * Excludes high-frequency events like TIME_UPDATE
   */
  attachDefaultListeners() {
    if (!this.player || !this.player.Event) return;
    
    const excluded = [
      this.player.Event.Core.TIME_UPDATE,
      this.player.Event.Core.PROGRESS,
      this.player.Event.Core.AD_AUTOPLAY_FAILED,
      this.player.Event.FRAG_LOADED,
      "playkit-ui-uivisibilitychanged",
      "playkit-ui-bottombarclientrectchanged"
    ];
    
    // Attach listeners for all events except excluded ones
    Object.keys(this.player.Event).forEach(key => {
      const evt = this.player.Event[key];
      if (typeof evt === "string" && !excluded.includes(evt)) {
        this.addEventListener(evt, () => logMessage("Event: " + evt));
      } else if (typeof evt === "object" && evt !== null) {
        Object.values(evt).forEach(val => {
          if (typeof val === "string" && !excluded.includes(val)) {
            this.addEventListener(val, () => logMessage("Event: " + val));
          }
        });
      }
    });
  }
}

export default RegularPlayer;