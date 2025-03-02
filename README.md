# Kaltura Player Reference Implementation

This project serves as a reference implementation for developers looking to integrate the Kaltura video player into their web applications using vanilla JavaScript. It demonstrates best practices for embedding, configuring, and controlling the Kaltura player in both regular and interactive modes.

## Purpose

This repository is designed as a **sample reference implementation** to showcase how developers can:

- Embed the Kaltura player in web applications
- Switch between regular and interactive (KalturaPath) player modes
- Implement custom player controls
- Handle player events
- Manage timeline markers and chapters
- Create a clean, modular architecture for player integration

## Project Structure

```
├── css/                  # Stylesheet files
│   ├── controls.css      # Styles for player controls
│   ├── main.css          # Main application styles
│   └── player.css        # Player-specific styles
├── js/                   # JavaScript modules
│   ├── controls/         # Custom player controls
│   ├── player/           # Player implementation
│   │   ├── player.js     # Base player functionality
│   │   ├── interactive.js # Interactive mode implementation
│   │   └── regular.js    # Regular mode implementation
│   └── utils/            # Utility functions
├── index.html            # Main HTML file
└── README.md             # This documentation
```

## Features

- **Dual Player Modes**:
  - Regular mode using standard Kaltura Player API
  - Interactive mode using KalturaPath API (PathKalturaPlayer)
  
- **Custom Controls**:
  - Play/pause toggle
  - Seek functionality
  - Volume control
  - Playback speed adjustment
  - Timeline markers and chapters (in regular mode)
  
- **Clean Architecture**:
  - Modular JavaScript with ES6+ features
  - Separation of concerns
  - Event-driven design
  - Responsive layout with modern CSS

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Basic understanding of HTML, CSS, and JavaScript
- Kaltura account with API access (for your own implementation)

### Usage

1. Clone or download this repository
2. Open `index.html` in a web browser
3. Explore the different player modes and controls

### Integration into Your Project

To integrate the Kaltura player into your own project:

1. Include the Kaltura Player script in your HTML:
   ```html
   <script src="https://cdnapisec.kaltura.com/p/YOUR_PARTNER_ID/embedPlaykitJs/uiconf_id/YOUR_UI_CONF_ID"></script>
   ```

2. Create a container element for the player:
   ```html
   <div id="kaltura_player"></div>
   ```

3. Initialize the player with your configuration:
   ```javascript
   // For regular mode
   const player = KalturaPlayer.setup({
     targetId: 'kaltura_player',
     provider: {
       partnerId: YOUR_PARTNER_ID,
       uiConfId: YOUR_UI_CONF_ID
     }
   });
   
   // Load media
   player.loadMedia({ entryId: 'YOUR_ENTRY_ID' });
   
   // For interactive mode
   const interactivePlayer = PathKalturaPlayer.setup({
     targetId: 'kaltura_player',
     provider: {
       partnerId: YOUR_PARTNER_ID,
       uiConfId: YOUR_UI_CONF_ID
     },
     rapt: {
       // KalturaPath-specific configuration
     }
   });
   
   // Load interactive media
   interactivePlayer.loadMedia({ playlistId: 'YOUR_PLAYLIST_ID' });
   ```

## Framework Integration

This reference implementation uses vanilla JavaScript for maximum compatibility and clarity. If you're using a framework or library in your project, you may need to adapt this code:

- **React**: Consider using the [Kaltura Player React component](https://github.com/kaltura/kaltura-player-js/blob/master/docs/guides.md#react-integration)
- **Angular**: Wrap the player initialization in a component lifecycle hook
- **Vue**: Create a custom component that handles player initialization
- **RequireJS/AMD**: Adapt the ES6 modules to AMD format

## Browser Support

This implementation supports modern browsers (Chrome, Firefox, Safari, Edge) and uses modern JavaScript and CSS features. IE11 support is not included.

## Security Considerations

The implementation includes a strict Content Security Policy (CSP) that allows only necessary external resources. Review and adapt this policy for your specific needs.

## Additional Resources

- [Kaltura Player Documentation](https://github.com/kaltura/kaltura-player-js/blob/master/docs/guides.md)
- [Player UI Documentation](https://github.com/kaltura/playkit-js-ui/blob/master/docs/guides.md)
- [UI-Managers Documentation](https://github.com/kaltura/playkit-js-ui-managers/blob/master/docs/guide.md)
- [Player Plugins Documentation](https://github.com/kaltura/playkit-js-ui-managers/blob/master/docs/guide.md)

## License

This project is licensed under the terms included in the [LICENSE](LICENSE) file.