# System Patterns

## Architecture Overview

We'll refactor the current monolithic implementation into a modular, component-based architecture following modern web development best practices.

## File Structure

```
/
├── index.html              # Main HTML structure
├── css/
│   ├── main.css            # Base styles and layout
│   ├── player.css          # Player-specific styles
│   └── controls.css        # Controls-specific styles
├── js/
│   ├── main.js             # Entry point and initialization
│   ├── player/
│   │   ├── player.js       # Player base functionality
│   │   ├── interactive.js  # Interactive mode functionality
│   │   └── regular.js      # Regular mode functionality
│   ├── controls/
│   │   ├── controls.js     # Controls base functionality
│   │   ├── playback.js     # Playback controls
│   │   ├── timeline.js     # Timeline controls
│   │   └── settings.js     # Settings controls
│   └── utils/
│       ├── logger.js       # Logging functionality
│       └── helpers.js      # Helper functions
```

## Design Patterns

### Module Pattern
We'll use ES6 modules to organize code into logical units with clear responsibilities.

```javascript
// Example: logger.js
export const logMessage = (msg, type) => {
  // Implementation
};
```

### Observer Pattern
For event handling and communication between components.

```javascript
// Example: player events
player.addEventListener('play', () => {
  // Update UI
});
```

### Factory Pattern
For creating player instances based on mode.

```javascript
// Example: player factory
export const createPlayer = (mode, config) => {
  if (mode === 'interactive') {
    return new InteractivePlayer(config);
  } else {
    return new RegularPlayer(config);
  }
};
```

## UI Component Structure

### Player Component
- Responsible for video playback
- Handles player initialization and mode switching
- Exposes API for controls

### Controls Component
- Organized into logical groups:
  - Playback controls (play/pause, volume, speed)
  - Timeline controls (seek, markers, chapters)
  - Settings controls (mode switching)
- Each control is a self-contained component

### Logger Component
- Displays event logs
- Filters and formats log messages

## State Management

We'll use a simple state management approach:

1. Core player state managed by the Kaltura Player API
2. UI state managed by individual components
3. Shared state passed through a central state object

## Styling Approach

1. Base styles for layout and typography
2. Component-specific styles
3. Responsive design using CSS Grid and Flexbox
4. CSS variables for theming and consistency