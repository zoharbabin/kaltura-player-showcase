# Technical Context

## Technologies Used

### Current Implementation
- HTML5
- CSS3
- Vanilla JavaScript
- Kaltura Player API
  - Regular mode: KalturaPlayer
  - Interactive mode: PathKalturaPlayer (RAPT API)

### Proposed Implementation
- HTML5
- CSS3 with modern features (Grid, Flexbox, Variables)
- ES6+ JavaScript with modules
- Kaltura Player API (unchanged)

## Technical Constraints

### API Compatibility
- Must maintain compatibility with Kaltura Player API
- Must support both Interactive and Regular modes
- Must preserve all existing functionality

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- No IE11 support required (based on modern CSS usage)

### Performance Considerations
- Minimize unnecessary DOM operations
- Optimize event listeners
- Ensure smooth playback and UI interactions

## Security Considerations

### Content Security Policy
The current implementation includes a strict CSP:
```
default-src 'none';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.kaltura.com https://www.google-analytics.com https://www.googletagmanager.com blob:;
worker-src 'self' blob:;
style-src 'self' 'unsafe-inline';
connect-src 'self' https://*.kaltura.com http://analytics.kaltura.com https://www.google-analytics.com https://pagead2.googlesyndication.com blob:;
img-src 'self' data: https://*.kaltura.com https://corp.kaltura.com https://www.google-analytics.com;
media-src 'self' data: blob: https://*.kaltura.com;
frame-src 'self' https://*.kaltura.com;
object-src 'none';
base-uri 'none';
form-action 'none';
block-all-mixed-content;
```

This CSP must be maintained in the refactored implementation.

## External Dependencies

### Kaltura Player
- Script: `https://cdnapisec.kaltura.com/p/2421271/embedPlaykitJs/uiconf_id/56335032`
- Partner ID: 2421271
- UI Config IDs:
  - Interactive mode: 43473121
  - Regular mode: 43473121

### Media Assets
- Interactive playlist ID: '1_zxnf9ha7'
- Regular entry ID: '1_71gyojxl'