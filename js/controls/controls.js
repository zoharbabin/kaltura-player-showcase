/**
 * Controls module for player controls
 */
import { logMessage } from '../utils/logger.js';
import { createElement, formatTime } from '../utils/helpers.js';
import { PLAYER_MODES } from '../player/player.js';

/**
 * Controls class for managing player controls
 */
export class Controls {
  /**
   * Create a controls instance
   * @param {Object} player - Player instance
   * @param {Object} options - Control options
   */
  constructor(player, options = {}) {
    this.player = player;
    this.options = {
      containerSelector: '.controls-container',
      updateInterval: 250, // ms
      ...options
    };
    
    this.container = document.querySelector(this.options.containerSelector);
    if (!this.container) {
      throw new Error(`Controls container not found: ${this.options.containerSelector}`);
    }
    
    this.currentMode = player.constructor.name === 'InteractivePlayer' 
      ? PLAYER_MODES.INTERACTIVE 
      : PLAYER_MODES.REGULAR;
      
    this.updateIntervalId = null;
    this.controlGroups = new Map();
  }
  
  /**
   * Initialize the controls
   */
  initialize() {
    this.createControlsStructure();
    this.startUpdates();
    this.attachEventListeners();
    logMessage('Controls initialized');
  }
  
  /**
   * Create the controls structure
   */
  createControlsStructure() {
    // Clear existing controls
    this.container.innerHTML = '';
    
    // Create mode indicator
    this.createModeIndicator();
    
    // Create main controls (play/pause, timeline)
    this.createMainControls();
    
    // Create control groups
    this.createPlaybackControls();
    
    // Create timeline controls (only for regular mode)
    if (this.currentMode === PLAYER_MODES.REGULAR) {
      this.createTimelineControls();
    }
  }
  
  /**
   * Create mode indicator
   */
  createModeIndicator() {
    const modeIndicator = createElement('div', { className: 'mode-indicator' }, [
      createElement('span', { className: 'mode-label' }, 
        `Current Mode: ${this.currentMode === PLAYER_MODES.INTERACTIVE ? 'Interactive Video' : 'Regular Video'}`
      ),
      createElement('button', { 
        className: 'btn btn-mode', 
        id: 'mode-toggle-btn',
        onclick: () => this.onModeToggle()
      }, `Switch to ${this.currentMode === PLAYER_MODES.INTERACTIVE ? 'Regular' : 'Interactive'} Video`)
    ]);
    
    this.container.appendChild(modeIndicator);
  }
  
  /**
   * Create main controls (play/pause, timeline)
   */
  createMainControls() {
    const mainControls = createElement('div', { className: 'controls-main' }, [
      // Play/Pause button
      createElement('button', {
        className: 'btn btn-icon',
        id: 'play-toggle-btn',
        onclick: () => this.onPlayToggle()
      }, '▶'), // Default to play icon since player is paused initially
      
      // Time display
      createElement('div', { className: 'time-display', id: 'time-display' }, '00:00 / 00:00'),
      
      // Timeline
      createElement('div', { className: 'timeline-container' }, [
        createElement('div', { className: 'timeline', id: 'timeline' }, [
          createElement('div', { className: 'timeline-progress', id: 'timeline-progress' }),
          createElement('div', { className: 'timeline-handle', id: 'timeline-handle' })
        ])
      ])
    ]);
    
    this.container.appendChild(mainControls);
    
    // Add timeline click event
    const timeline = document.getElementById('timeline');
    if (timeline) {
      timeline.addEventListener('click', (e) => this.onTimelineClick(e));
    }
  }
  
  /**
   * Create playback controls (volume, speed)
   */
  createPlaybackControls() {
    const playbackControls = createElement('div', { className: 'controls-group' }, [
      createElement('div', { className: 'controls-group-title' }, 'Playback Controls'),
      
      // Volume control
      createElement('div', { className: 'controls-row' }, [
        createElement('div', { className: 'slider-container' }, [
          createElement('span', { className: 'slider-label' }, 'Volume:'),
          createElement('input', { 
            type: 'range', 
            className: 'slider', 
            id: 'volume-slider', 
            min: '0', 
            max: '100', 
            value: '50',
            oninput: (e) => this.onVolumeChange(e)
          }),
          createElement('span', { className: 'slider-value', id: 'volume-value' }, '50%')
        ])
      ]),
      
      // Speed control
      createElement('div', { className: 'controls-row' }, [
        createElement('div', { className: 'slider-container' }, [
          createElement('span', { className: 'slider-label' }, 'Speed:'),
          createElement('input', { 
            type: 'range', 
            className: 'slider', 
            id: 'speed-slider', 
            min: '0.1', 
            max: '2', 
            step: '0.1', 
            value: '1',
            oninput: (e) => this.onSpeedChange(e)
          }),
          createElement('span', { className: 'slider-value', id: 'speed-value' }, '1x')
        ])
      ])
    ]);
    
    this.container.appendChild(playbackControls);
    this.controlGroups.set('playback', playbackControls);
  }
  
  /**
   * Create timeline controls (markers, chapters)
   */
  createTimelineControls() {
    const timelineControls = createElement('div', { className: 'controls-group' }, [
      createElement('div', { className: 'controls-group-title' }, 'Timeline Controls'),
      
      createElement('div', { className: 'timeline-controls' }, [
        createElement('button', { 
          className: 'btn', 
          id: 'addMarkersBtn',
          onclick: () => this.onAddMarkers()
        }, 'Add 3 Diamond Markers'),
        
        createElement('button', { 
          className: 'btn', 
          id: 'addChaptersBtn',
          onclick: () => this.onAddChapters()
        }, 'Add 3 Chapters'),
        
        createElement('button', { 
          className: 'btn btn-secondary', 
          id: 'clearAllBtn',
          onclick: () => this.onClearTimeline()
        }, 'Clear Timeline')
      ])
    ]);
    
    this.container.appendChild(timelineControls);
    this.controlGroups.set('timeline', timelineControls);
  }
  
  /**
   * Start periodic updates
   */
  startUpdates() {
    this.stopUpdates();
    this.updateIntervalId = setInterval(() => this.updateControls(), this.options.updateInterval);
  }
  
  /**
   * Stop periodic updates
   */
  stopUpdates() {
    if (this.updateIntervalId) {
      clearInterval(this.updateIntervalId);
      this.updateIntervalId = null;
    }
  }
  
  /**
   * Update controls state
   */
  updateControls() {
    this.updateTimeDisplay();
    this.updatePlayButton();
    this.updateTimeline();
  }
  
  /**
   * Update time display
   */
  updateTimeDisplay() {
    const timeDisplay = document.getElementById('time-display');
    if (!timeDisplay) return;
    
    const currentTime = this.player.currentTime || 0;
    const duration = this.player.duration || 0;
    
    timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
  }
  
  /**
   * Update play button state
   */
  updatePlayButton() {
    const playButton = document.getElementById('play-toggle-btn');
    if (!playButton) return;
    
    if (this.player && typeof this.player.paused === 'boolean') {
      // Store current state to check if it changed
      const wasPaused = playButton.textContent === '▶';
      const isPaused = this.player.paused;
      
      // Only update the button if the state changed
      if (wasPaused !== isPaused) {
        playButton.textContent = isPaused ? '▶' : '❚❚';
        logMessage(`Button state updated: ${isPaused ? 'paused' : 'playing'}`);
      }
    } else {
      // Default to play icon if player state is unknown
      playButton.textContent = '▶';
    }
  }
  
  /**
   * Update timeline position
   */
  updateTimeline() {
    const progress = document.getElementById('timeline-progress');
    const handle = document.getElementById('timeline-handle');
    if (!progress || !handle) return;
    
    const currentTime = this.player.currentTime || 0;
    const duration = this.player.duration || 0;
    
    if (duration > 0) {
      const percent = (currentTime / duration) * 100;
      progress.style.width = `${percent}%`;
      handle.style.left = `${percent}%`;
    } else {
      progress.style.width = '0%';
      handle.style.left = '0%';
    }
  }
  
  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Player events
    if (this.player) {
      // Update controls when playback state changes
      this.player.addEventListener('play', () => this.updateControls());
      this.player.addEventListener('pause', () => this.updateControls());
      this.player.addEventListener('ended', () => this.updateControls());
      this.player.addEventListener('seeking', () => this.updateControls());
      this.player.addEventListener('seeked', () => this.updateControls());
      this.player.addEventListener('durationchange', () => this.updateControls());
    }
  }
  
  /**
   * Handle play/pause button click
   */
  onPlayToggle() {
    if (!this.player) return;
    
    const playButton = document.getElementById('play-toggle-btn');
    if (!playButton) return;
    
    if (this.player.paused) {
      // If player is paused, play it
      this.player.play()
        .then(() => {
          playButton.textContent = '❚❚'; // Change to pause icon
          this.updateControls();
          logMessage('Playback started');
        })
        .catch(error => {
          logMessage(`Error starting playback: ${error.message}`, 'error');
        });
    } else {
      // If player is playing, pause it
      this.player.pause();
      playButton.textContent = '▶'; // Change to play icon
      this.updateControls();
      logMessage('Playback paused');
    }
  }
  
  /**
   * Handle timeline click
   * @param {Event} event - Click event
   */
  onTimelineClick(event) {
    if (!this.player) return;
    
    const timeline = event.currentTarget;
    const rect = timeline.getBoundingClientRect();
    const clickPos = (event.clientX - rect.left) / rect.width;
    
    const duration = this.player.duration || 0;
    if (duration > 0) {
      // Use seek method instead of direct property assignment
      this.player.seek(clickPos * duration);
      this.updateControls();
    }
  }
  
  /**
   * Handle volume change
   * @param {Event} event - Input event
   */
  onVolumeChange(event) {
    if (!this.player) return;
    
    const volume = Number(event.target.value) / 100;
    // Use setVolume method instead of direct property assignment
    this.player.setVolume(volume);
    
    const volumeValue = document.getElementById('volume-value');
    if (volumeValue) {
      volumeValue.textContent = `${Math.round(volume * 100)}%`;
    }
  }
  
  /**
   * Handle speed change
   * @param {Event} event - Input event
   */
  onSpeedChange(event) {
    if (!this.player) return;
    
    const speed = Number(event.target.value);
    // Use setPlaybackRate method instead of direct property assignment
    this.player.setPlaybackRate(speed);
    
    const speedValue = document.getElementById('speed-value');
    if (speedValue) {
      speedValue.textContent = `${speed}x`;
    }
  }
  
  /**
   * Handle mode toggle
   */
  onModeToggle() {
    // This will be implemented in main.js
    // We'll dispatch a custom event that main.js will listen for
    const event = new CustomEvent('mode-toggle', {
      detail: {
        currentMode: this.currentMode,
        nextMode: this.currentMode === PLAYER_MODES.INTERACTIVE ? PLAYER_MODES.REGULAR : PLAYER_MODES.INTERACTIVE
      }
    });
    document.dispatchEvent(event);
  }
  
  /**
   * Handle add markers button click
   */
  onAddMarkers() {
    if (this.currentMode !== PLAYER_MODES.REGULAR) {
      alert('Timeline markers are not supported in Interactive mode.');
      return;
    }
    
    const duration = this.player.duration;
    if (!duration) {
      alert('Video duration not available.');
      return;
    }
    
    // Create 3 markers at different positions
    const times = Array.from({ length: 3 }, (_, i) => {
      const gap = (duration * 0.8) / 3;
      return +(duration * 0.1 + gap * i + Math.random() * (gap * 0.8)).toFixed(1);
    });
    
    // Add markers using the player's method
    if (typeof this.player.addDiamondMarkers === 'function') {
      this.player.addDiamondMarkers(times);
    } else {
      logMessage('Add markers functionality not available', 'error');
    }
  }
  
  /**
   * Handle add chapters button click
   */
  onAddChapters() {
    if (this.currentMode !== PLAYER_MODES.REGULAR) {
      alert('Timeline chapters are not supported in Interactive mode.');
      return;
    }
    
    const duration = this.player.duration;
    if (!duration) {
      alert('Video duration not available.');
      return;
    }
    
    // Create 3 chapters at 25%, 50%, and 75% of the video
    const chapters = [0.25, 0.5, 0.75].map((frac, idx) => ({
      time: duration * frac,
      title: `Chapter ${idx + 1}`,
      id: `chapter-${idx}`
    }));
    
    // Add chapters using the player's method
    if (typeof this.player.addChapters === 'function') {
      this.player.addChapters(chapters);
    } else {
      logMessage('Add chapters functionality not available', 'error');
    }
  }
  
  /**
   * Handle clear timeline button click
   */
  onClearTimeline() {
    if (this.currentMode !== PLAYER_MODES.REGULAR) {
      alert('Timeline functions are not supported in Interactive mode.');
      return;
    }
    
    // Clear timeline using the player's method
    if (typeof this.player.clearTimeline === 'function') {
      this.player.clearTimeline();
    } else {
      logMessage('Clear timeline functionality not available', 'error');
    }
  }
  
  /**
   * Destroy the controls
   */
  destroy() {
    this.stopUpdates();
    this.container.innerHTML = '';
    this.controlGroups.clear();
    logMessage('Controls destroyed');
  }
}

export default Controls;