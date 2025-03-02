/**
 * Main application module
 */
import { logMessage, clearLog } from './utils/logger.js';
import { createPlayer, PLAYER_MODES } from './player/player.js';
import { RegularPlayer } from './player/regular.js';
import { Controls } from './controls/controls.js';

/**
 * Application class
 */
class KalturaPlayerApp {
  /**
   * Create an application instance
   */
  constructor() {
    this.player = null;
    this.controls = null;
    this.currentMode = PLAYER_MODES.INTERACTIVE;
  }
  
  /**
   * Initialize the application
   */
  async initialize() {
    try {
      // Initialize with interactive mode by default
      await this.initializeMode(this.currentMode);
      
      // Listen for mode toggle events
      document.addEventListener('mode-toggle', async (event) => {
        try {
          await this.handleModeToggle(event);
        } catch (error) {
          logMessage(`Error in mode-toggle event handler: ${error.message}`, 'error');
        }
      });
      
      logMessage('Application initialized');
    } catch (error) {
      logMessage(`Error initializing application: ${error.message}`, 'error');
    }
  }
  
  /**
   * Initialize a specific player mode
   * @param {string} mode - Player mode
   */
  async initializeMode(mode) {
    logMessage(`Starting initializeMode for ${mode} mode`);
    try {
      // Destroy existing player and controls
      logMessage('Destroying current player and controls');
      await this.destroyCurrentPlayer();
      logMessage('Player and controls destroyed successfully');
      
      // Clear the log
      clearLog();
      
      // Create player container if it doesn't exist
      logMessage('Ensuring player container exists');
      this.ensurePlayerContainer();
      logMessage('Player container ready');
      
      // Add a longer delay to ensure DOM is fully ready after destroying previous player
      // This helps prevent visibility.js errors in the Kaltura Player
      logMessage('Waiting for DOM to settle after player destruction');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Ensure DOM is ready before proceeding
      logMessage('Ensuring DOM is ready');
      await this.ensureDomReady();
      logMessage('DOM is ready');
      
      // Create player based on mode
      const config = this.getPlayerConfig(mode);
      logMessage(`Creating ${mode} player with config: ${JSON.stringify(config)}`);
      
      try {
        // Wrap in try-catch to handle any errors during player creation
        if (mode === PLAYER_MODES.REGULAR) {
          logMessage('Initializing Regular mode player');
          // For Regular mode, use a more direct approach to avoid potential issues
          if (typeof KalturaPlayer === 'undefined') {
            logMessage('KalturaPlayer is undefined', 'error');
            throw new Error('KalturaPlayer is not defined. Make sure the Kaltura Player API is loaded.');
          }
          
          logMessage('KalturaPlayer is defined, proceeding with setup');
          
          // For Regular mode, we'll use the createPlayer function just like for Interactive mode
          // This ensures consistent initialization and avoids ID conflicts
          logMessage('Using createPlayer for Regular mode');
          this.player = await createPlayer(mode, config);
        } else {
          // For Interactive mode, use the createPlayer function
          this.player = await createPlayer(mode, config);
        }
      } catch (playerError) {
        logMessage(`Error creating player: ${playerError.message}`, 'error');
        // Try one more time with a longer delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          this.player = await createPlayer(mode, config);
        } catch (retryError) {
          logMessage(`Error on retry: ${retryError.message}`, 'error');
          throw retryError;
        }
      }
      
      // Load media
      const mediaConfig = mode === PLAYER_MODES.INTERACTIVE
        ? { playlistId: '1_zxnf9ha7' }
        : { entryId: '1_71gyojxl' };
      logMessage(`Loading media for ${mode} mode...`);
      
      try {
        await this.player.loadMedia(mediaConfig);
      } catch (mediaError) {
        logMessage(`Error loading media: ${mediaError.message}`, 'error');
        // Try one more time
        await new Promise(resolve => setTimeout(resolve, 500));
        await this.player.loadMedia(mediaConfig);
      }
      
      // Create controls
      logMessage('Creating controls...');
      this.controls = new Controls(this.player, {
        containerSelector: '.controls-container'
      });
      this.controls.initialize();
      
      // Attach default event listeners
      if (mode === PLAYER_MODES.INTERACTIVE) {
        this.player.attachDefaultListeners();
        logMessage('Interactive playlist (1_zxnf9ha7) loaded.');
      } else {
        this.player.attachDefaultListeners();
        logMessage('Regular entry (1_71gyojxl) loaded.');
      }
      
      this.currentMode = mode;
      logMessage(`Successfully switched to ${mode} mode`);
    } catch (error) {
      logMessage(`Error initializing ${mode} mode: ${error.message}`, 'error');
      
      // If there's an error, try to recover by initializing the other mode
      if (this.player === null && this.controls === null) {
        const fallbackMode = mode === PLAYER_MODES.INTERACTIVE ? PLAYER_MODES.REGULAR : PLAYER_MODES.INTERACTIVE;
        logMessage(`Attempting to recover by initializing ${fallbackMode} mode...`);
        try {
          // Add a longer delay before trying the fallback
          await new Promise(resolve => setTimeout(resolve, 1000));
          await this.initializeMode(fallbackMode);
        } catch (fallbackError) {
          logMessage(`Recovery failed: ${fallbackError.message}`, 'error');
        }
      }
    }
  }
  
  /**
   * Get player configuration based on mode
   * @param {string} mode - Player mode
   * @returns {Object} Player configuration
   */
  getPlayerConfig(mode) {
    const baseConfig = {
      targetId: 'kaltura_player',
      playback: { autoplay: false, preload: 'auto' },
      provider: { partnerId: 2421271, uiConfId: 43473121 },
      log: { level: 'ERROR', playerVersion: false }
    };
    
    if (mode === PLAYER_MODES.INTERACTIVE) {
      return {
        ...baseConfig,
        rapt: { debug: false, bufferNextNodes: true, showScrubber: true, showTimers: true, showSettings: true }
      };
    }
    
    return baseConfig;
  }
  
  /**
   * Ensure player container exists
   */
  ensurePlayerContainer() {
    const wrapper = document.querySelector('.player-wrapper');
    if (wrapper) {
      // Clear any existing content
      wrapper.innerHTML = '';
      
      // Make sure there are no other elements with the same ID in the DOM
      const existingElements = document.querySelectorAll('#kaltura_player');
      existingElements.forEach(el => {
        if (el && el.parentNode && el !== wrapper) {
          el.parentNode.removeChild(el);
        }
      });
      
      // Create a fresh player container
      const playerContainer = document.createElement('div');
      playerContainer.id = 'kaltura_player';
      wrapper.appendChild(playerContainer);
      
      logMessage('Player container created with fresh ID');
    }
  }
  
  /**
   * Ensure DOM is ready before initializing player
   * @returns {Promise} Promise that resolves when DOM is ready
   */
  async ensureDomReady() {
    // Return a promise that resolves when the DOM is ready
    return new Promise(resolve => {
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        // DOM is already ready
        setTimeout(resolve, 100); // Small delay to ensure any pending DOM operations complete
      } else {
        // Wait for DOM to be ready
        document.addEventListener('DOMContentLoaded', () => setTimeout(resolve, 100));
      }
    });
  }
  
  /**
   * Destroy current player and controls
   */
  async destroyCurrentPlayer() {
    if (this.controls) {
      this.controls.destroy();
      this.controls = null;
      logMessage('Controls destroyed');
    }
    
    if (this.player) {
      this.player.destroy();
      this.player = null;
      logMessage('Player destroyed');
    }
    
    // Allow time for the player to be fully destroyed
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Clean up any remaining player elements that might be left in the DOM
    const playerElements = document.querySelectorAll('.kaltura-player-container, .playkit-player, .kaltura-player');
    playerElements.forEach(el => {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
    
    // Remove any global Kaltura Player instances
    if (window.KalturaPlayer && typeof window.KalturaPlayer.destroy === 'function') {
      try {
        window.KalturaPlayer.destroy();
      } catch (error) {
        logMessage(`Warning: Error during KalturaPlayer.destroy(): ${error.message}`, 'error');
      }
    }
    
    // Clean up any script-created elements with ID kaltura_player
    const existingPlayerElement = document.getElementById('kaltura_player');
    if (existingPlayerElement) {
      existingPlayerElement.parentNode.removeChild(existingPlayerElement);
    }
  }
  
  /**
   * Handle mode toggle event
   * @param {CustomEvent} event - Mode toggle event
   */
  async handleModeToggle(event) {
    const { nextMode } = event.detail;
    logMessage(`Mode toggle event received. Switching from ${this.currentMode} to ${nextMode}`);
    
    try {
      // Make sure we properly await the mode initialization
      await this.initializeMode(nextMode);
    } catch (error) {
      logMessage(`Error in handleModeToggle: ${error.message}`, 'error');
      logMessage(`Error stack: ${error.stack}`, 'error');
    }
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new KalturaPlayerApp();
  app.initialize();
});

// Export for testing
export default KalturaPlayerApp;