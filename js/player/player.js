/**
 * Base Player module for common player functionality
 */
import { logMessage } from '../utils/logger.js';
import { getNestedValue } from '../utils/helpers.js';

// Player modes
export const PLAYER_MODES = {
  INTERACTIVE: 'interactive',
  REGULAR: 'regular'
};

/**
 * Base Player class with common functionality
 */
export class BasePlayer {
  /**
   * Create a player instance
   * @param {Object} config - Player configuration
   */
  constructor(config = {}) {
    this.config = config;
    this.player = null;
    this.targetId = config.targetId || 'kaltura_player';
    this.eventListeners = new Map();
  }
  
  /**
   * Initialize the player
   * @returns {Promise} Promise that resolves when the player is ready
   */
  async initialize() {
    throw new Error('initialize() must be implemented by subclass');
  }
  
  /**
   * Load media content
   * @param {Object} mediaConfig - Media configuration
   * @returns {Promise} Promise that resolves when media is loaded
   */
  async loadMedia(mediaConfig) {
    throw new Error('loadMedia() must be implemented by subclass');
  }
  
  /**
   * Destroy the player instance
   */
  destroy() {
    if (this.player && typeof this.player.destroy === 'function') {
      this.player.destroy();
      this.player = null;
    }
    this.eventListeners.clear();
    logMessage('Player destroyed');
  }
  
  /**
   * Add an event listener to the player
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  addEventListener(event, callback) {
    if (!this.player) {
      logMessage('Player not initialized', 'error');
      return;
    }
    
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    
    this.eventListeners.get(event).add(callback);
    
    // Actual implementation depends on the player type
    this._attachEventListener(event, callback);
  }
  
  /**
   * Remove an event listener from the player
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  removeEventListener(event, callback) {
    if (!this.player) {
      logMessage('Player not initialized', 'error');
      return;
    }
    
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(callback);
    }
    
    // Actual implementation depends on the player type
    this._detachEventListener(event, callback);
  }
  
  /**
   * Attach an event listener to the underlying player
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @protected
   */
  _attachEventListener(event, callback) {
    throw new Error('_attachEventListener() must be implemented by subclass');
  }
  
  /**
   * Detach an event listener from the underlying player
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @protected
   */
  _detachEventListener(event, callback) {
    throw new Error('_detachEventListener() must be implemented by subclass');
  }
  
  /**
   * Get the underlying player instance
   * @returns {Object} The player instance
   */
  getPlayer() {
    return this.player;
  }
  
  /**
   * Check if the player is paused
   * @returns {boolean} True if paused, false otherwise
   */
  get paused() {
    return this.player ? this.player.paused : true;
  }
  
  /**
   * Get the current playback time
   * @returns {number} Current time in seconds
   */
  get currentTime() {
    return this.player ? this.player.currentTime : 0;
  }
  
  /**
   * Set the current playback time
   * @param {number} time - Time in seconds
   */
  set currentTime(time) {
    if (!this.player) return;
    
    try {
      // Try seek method first (common in media players)
      if (typeof this.player.seek === 'function') {
        this.player.seek(time);
      } else {
        // Fall back to property assignment
        this.player.currentTime = time;
      }
    } catch (error) {
      logMessage(`Cannot set currentTime: ${error.message}`, 'error');
    }
  }
  
  /**
   * Seek to a specific time
   * @param {number} time - Time in seconds
   */
  seek(time) {
    this.currentTime = time;
  }
  
  /**
   * Get the media duration
   * @returns {number} Duration in seconds
   */
  get duration() {
    return this.player ? this.player.duration : 0;
  }
  
  /**
   * Get the current volume
   * @returns {number} Volume from 0 to 1
   */
  get volume() {
    return this.player ? this.player.volume : 0;
  }
  
  /**
   * Set the volume
   * @param {number} value - Volume from 0 to 1
   */
  set volume(value) {
    if (!this.player) return;
    
    const safeValue = Math.max(0, Math.min(1, value));
    
    try {
      // Try setVolume method first
      if (typeof this.player.setVolume === 'function') {
        this.player.setVolume(safeValue);
      } else {
        // Fall back to property assignment
        this.player.volume = safeValue;
      }
    } catch (error) {
      logMessage(`Cannot set volume: ${error.message}`, 'error');
    }
  }
  
  /**
   * Set the volume directly
   * @param {number} value - Volume from 0 to 1
   */
  setVolume(value) {
    this.volume = value;
  }
  
  /**
   * Get the current playback rate
   * @returns {number} Playback rate
   */
  get playbackRate() {
    return this.player ? this.player.playbackRate : 1;
  }
  
  /**
   * Set the playback rate
   * @param {number} rate - Playback rate
   */
  set playbackRate(rate) {
    if (!this.player) return;
    
    try {
      // Try setPlaybackRate method first
      if (typeof this.player.setPlaybackRate === 'function') {
        this.player.setPlaybackRate(rate);
      } else {
        // Fall back to property assignment
        this.player.playbackRate = rate;
      }
    } catch (error) {
      logMessage(`Cannot set playbackRate: ${error.message}`, 'error');
    }
  }
  
  /**
   * Set the playback rate directly
   * @param {number} rate - Playback rate
   */
  setPlaybackRate(rate) {
    this.playbackRate = rate;
  }
  
  /**
   * Play the media
   * @returns {Promise} Promise that resolves when playback starts
   */
  async play() {
    if (this.player) {
      try {
        await this.player.play();
        logMessage('Playback started');
        return true;
      } catch (error) {
        logMessage(`Error starting playback: ${error.message}`, 'error');
        return false;
      }
    }
    return false;
  }
  
  /**
   * Pause the media
   */
  pause() {
    if (this.player) {
      this.player.pause();
      logMessage('Playback paused');
    }
  }
  
  /**
   * Toggle play/pause
   * @returns {Promise} Promise that resolves when the action is complete
   */
  async togglePlay() {
    if (this.paused) {
      return this.play();
    } else {
      this.pause();
      return true;
    }
  }
  
  /**
   * Get a service from the player
   * @param {string} serviceName - Name of the service
   * @returns {Object|null} The service or null if not available
   */
  getService(serviceName) {
    if (!this.player || typeof this.player.getService !== 'function') {
      return null;
    }
    return this.player.getService(serviceName);
  }
}

/**
 * Create a player instance based on the specified mode
 * @param {string} mode - Player mode (interactive or regular)
 * @param {Object} config - Player configuration
 * @returns {Promise<BasePlayer>} Promise that resolves to a player instance
 */
export const createPlayer = async (mode, config = {}) => {
  try {
    let PlayerClass;
    
    if (mode === PLAYER_MODES.INTERACTIVE) {
      const { InteractivePlayer } = await import('./interactive.js');
      PlayerClass = InteractivePlayer;
    } else {
      const { RegularPlayer } = await import('./regular.js');
      PlayerClass = RegularPlayer;
    }
    
    const player = new PlayerClass(config);
    await player.initialize();
    return player;
  } catch (error) {
    logMessage(`Error creating player: ${error.message}`, 'error');
    throw error;
  }
};

export default {
  BasePlayer,
  createPlayer,
  PLAYER_MODES
};