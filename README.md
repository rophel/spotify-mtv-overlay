# Spotify MTV Overlay

A browser extension that adds MTV-style artist/album/label overlay text in the bottom left corner while Spotify plays music video playlists on the web player.

## Features

- 🎵 Displays artist, album, and label information in an MTV-style overlay
- ⏱️ Customizable display duration (3-20 seconds)
- 📏 Adjustable font sizes (small, medium, large)
- 🎨 Modern glassmorphic design with smooth animations
- 🔧 Easy toggle on/off via extension popup
- 💚 Spotify-themed color scheme

## Screenshots

![Lifestyles of the Rich & Famous by Good Charlotte](https://private-user-images.githubusercontent.com/6263214/535969436-d727b18b-b720-488e-b212-c90ae7fc0a5b.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3Njg0MzU4MTUsIm5iZiI6MTc2ODQzNTUxNSwicGF0aCI6Ii82MjYzMjE0LzUzNTk2OTQzNi1kNzI3YjE4Yi1iNzIwLTQ4OGUtYjIxMi1jOTBhZTdmYzBhNWIucG5nP1gtQW16LUFsZ29yaXRobT1BV1M0LUhNQUMtU0hBMjU2JlgtQW16LUNyZWRlbnRpYWw9QUtJQVZDT0RZTFNBNTNQUUs0WkElMkYyMDI2MDExNSUyRnVzLWVhc3QtMSUyRnMzJTJGYXdzNF9yZXF1ZXN0JlgtQW16LURhdGU9MjAyNjAxMTVUMDAwNTE1WiZYLUFtei1FeHBpcmVzPTMwMCZYLUFtei1TaWduYXR1cmU9ODk5Nzc3ZGQ3ZGQzNDRiZWZmZWE1OTgyYzg0YTYxMjFmYTY5ZDczZDc4YzdiNzM5ZDVkZWM3OTRmMDk2ZWI4MCZYLUFtei1TaWduZWRIZWFkZXJzPWhvc3QifQ.stIGd0VBHmabhWiN6OYSnmJVHXQfZUCQd68dsZ40mEE)

## Installation

### Chrome/Edge/Brave

1. Open your browser and navigate to the extensions page:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Brave: `brave://extensions/`

2. Enable "Developer mode" (toggle in the top right)

3. Click "Load unpacked"

4. Select the `spotify-mtv-overlay` folder

5. The extension should now appear in your extensions list

6. Navigate to [open.spotify.com](https://open.spotify.com) and play any music video or track

## Usage

1. Open Spotify Web Player (https://open.spotify.com)
2. Play any track or music video
3. The MTV-style overlay will appear in the bottom left corner showing:
   - Artist name (bold, uppercase)
   - Album name (italic)
   - Record label (when available)

### Settings

Click the extension icon in your browser toolbar to access settings:

- **Enable Overlay**: Toggle the overlay on/off
- **Display Duration**: How long the overlay stays visible (3-20 seconds)
- **Font Size**: Choose between small, medium, or large text

## For Android TV

While this extension works on web browsers, adapting it for Android TV would require:

1. **Spotify Android TV app modification** (requires root/custom ROM) - Not recommended
2. **Custom Android TV app** that overlays on top of Spotify - Complex and requires sideloading
3. **Web-based approach**: Use the Spotify web player in a TV browser with this extension

The easiest path for Android TV is to:
- Install a browser on Android TV (e.g., TV Bro, Puffin TV Browser)
- Install this extension (if the browser supports extensions)
- Use Spotify Web Player instead of the native app

## Customization

Edit `overlay.css` to customize the appearance:

- Change colors, fonts, positioning
- Uncomment the MTV-80s style section for a retro look
- Adjust animation timings and effects

## Limitations

- Only works on Spotify Web Player (not the desktop app)
- Record label information is not easily accessible from Spotify's UI, so it may be empty
- Requires browser extension support

## Technical Details

- **Manifest Version**: 3
- **Permissions**: Storage (for settings)
- **Host Permissions**: open.spotify.com
- Uses MutationObserver to detect track changes
- CSS glassmorphism effects with backdrop-filter

## Troubleshooting

**Overlay not appearing:**
- Make sure the extension is enabled
- Check that you're on open.spotify.com
- Refresh the Spotify page
- Check extension settings (click the extension icon)

**Overlay showing wrong information:**
- Spotify's DOM structure occasionally changes
- Try refreshing the page
- Report the issue if it persists

## Future Enhancements

- [ ] Fetch record label info from Spotify API
- [ ] Multiple overlay style themes (MTV, VH1, modern)
- [ ] Position customization
- [ ] Lyrics integration
- [ ] Video detection (only show for music videos)

## License

MIT License - Feel free to modify and distribute

## Contributing

Pull requests welcome! Ideas for improvement:
- Better Spotify DOM selectors
- Additional styling themes
- Android TV native solution
