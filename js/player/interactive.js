/**
 * Interactive Player module for RAPT API integration
 */
import { BasePlayer } from './player.js';
import { logMessage } from '../utils/logger.js';

/**
 * Interactive Player class for RAPT API
 * @extends BasePlayer
 */
export class InteractivePlayer extends BasePlayer {
  /**
   * Create an interactive player instance
   * @param {Object} config - Player configuration
   */
  constructor(config = {}) {
    super(config);
    
    // Default configuration for interactive mode
    this.config = {
      targetId: 'kaltura_player',
      playback: { autoplay: false, preload: 'auto' },
      provider: { partnerId: 2421271, uiConfId: 43473121 },
      log: { level: 'ERROR', playerVersion: false },
      rapt: { debug: false, bufferNextNodes: true, showScrubber: true, showTimers: true, showSettings: true },
      ...config
    };
  }
  
  /**
   * Initialize the interactive player
   * @returns {Promise} Promise that resolves when the player is ready
   */
  async initialize() {
    try {
      if (typeof PathKalturaPlayer === 'undefined') {
        throw new Error('PathKalturaPlayer is not defined. Make sure the RAPT API is loaded.');
      }
      
      this.player = PathKalturaPlayer.setup(this.config);
      logMessage('Interactive player initialized');
      return this.player;
    } catch (error) {
      logMessage(`Error initializing interactive player: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * Load interactive media content
   * @param {Object} mediaConfig - Media configuration with playlistId
   * @returns {Promise} Promise that resolves when media is loaded
   */
  async loadMedia(mediaConfig = { playlistId: '1_zxnf9ha7' }) {
    try {
      if (!this.player) {
        throw new Error('Player not initialized');
      }
      
      await this.player.loadMedia(mediaConfig);
      logMessage(`Interactive playlist (${mediaConfig.playlistId}) loaded`);
      return true;
    } catch (error) {
      logMessage(`Error loading interactive media: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * Attach an event listener to the interactive player
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @protected
   */
  _attachEventListener(event, callback) {
    if (!this.player) return;
    
    // Interactive player uses addListener method
    this.player.addListener(event, callback);
  }
  
  /**
   * Detach an event listener from the interactive player
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @protected
   */
  _detachEventListener(event, callback) {
    if (!this.player) return;
    
    // Interactive player uses removeListener method
    if (typeof this.player.removeListener === 'function') {
      this.player.removeListener(event, callback);
    }
  }
  
  /**
   * Get the underlying player instance
   * @returns {Object} The player instance or active player
   */
  getPlayer() {
    if (!this.player) return null;
    
    // In interactive mode, we need to get the active player
    return this.player.playerManager?.activePlayer?.player || this.player;
  }
  
  /**
   * Check if the player is paused
   * @returns {boolean} True if paused, false otherwise
   */
  get paused() {
    const activePlayer = this.getPlayer();
    if (activePlayer && typeof activePlayer.paused === 'boolean') {
      return activePlayer.paused;
    }
    // Default to true if we can't determine the state
    return true;
  }
  
  /**
   * Play the media
   * @returns {Promise} Promise that resolves when playback starts
   */
  async play() {
    if (!this.player) return false;
    
    try {
      const activePlayer = this.getPlayer();
      if (activePlayer && typeof activePlayer.play === 'function') {
        await activePlayer.play();
      } else if (typeof this.player.play === 'function') {
        await this.player.play();
      } else {
        throw new Error('Play method not available');
      }
      logMessage('Playback started');
      return true;
    } catch (error) {
      logMessage(`Error starting playback: ${error.message}`, 'error');
      return false;
    }
  }
  
  /**
   * Pause the media
   */
  pause() {
    if (!this.player) return;
    
    try {
      const activePlayer = this.getPlayer();
      if (activePlayer && typeof activePlayer.pause === 'function') {
        activePlayer.pause();
      } else if (typeof this.player.pause === 'function') {
        this.player.pause();
      } else {
        throw new Error('Pause method not available');
      }
      logMessage('Playback paused');
    } catch (error) {
      logMessage(`Error pausing playback: ${error.message}`, 'error');
    }
  }
  
  /**
   * Override seek method for interactive player
   * @param {number} time - Time in seconds
   */
  seek(time) {
    if (!this.player) return;
    
    try {
      const activePlayer = this.getPlayer();
      if (activePlayer && typeof activePlayer.currentTime === 'number') {
        activePlayer.currentTime = time;
      } else if (typeof this.player.seek === 'function') {
        this.player.seek(time);
      } else {
        logMessage('Cannot seek: Method not available', 'error');
      }
    } catch (error) {
      logMessage(`Error seeking: ${error.message}`, 'error');
    }
  }
  
  /**
   * Override setVolume method for interactive player
   * @param {number} value - Volume from 0 to 1
   */
  setVolume(value) {
    if (!this.player) return;
    
    try {
      const activePlayer = this.getPlayer();
      if (activePlayer && typeof activePlayer.volume === 'number') {
        activePlayer.volume = Math.max(0, Math.min(1, value));
      } else if (typeof this.player.setVolume === 'function') {
        this.player.setVolume(value);
      } else {
        logMessage('Cannot set volume: Method not available', 'error');
      }
    } catch (error) {
      logMessage(`Error setting volume: ${error.message}`, 'error');
    }
  }
  
  /**
   * Override setPlaybackRate method for interactive player
   * @param {number} rate - Playback rate
   */
  setPlaybackRate(rate) {
    if (!this.player) return;
    
    try {
      const activePlayer = this.getPlayer();
      if (activePlayer && typeof activePlayer.playbackRate === 'number') {
        activePlayer.playbackRate = rate;
      } else if (typeof this.player.setPlaybackRate === 'function') {
        this.player.setPlaybackRate(rate);
      } else {
        logMessage('Cannot set playback rate: Method not available', 'error');
      }
    } catch (error) {
      logMessage(`Error setting playback rate: ${error.message}`, 'error');
    }
  }
  
  /**
   * Attach default interactive event listeners
   */
  attachDefaultListeners() {
    this.addEventListener('hotspot:click', () => logMessage('Interactive Event: hotspot:click'));
    this.addEventListener('node:enter', () => logMessage('Interactive Event: node:enter'));
    // Add more default listeners as needed
  }
}

export default InteractivePlayer;