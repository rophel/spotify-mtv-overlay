# Spotify MTV Overlay

A Chrome browser extension that adds MTV-style artist/album/label overlay text in the bottom left corner while Spotify plays music video playlists on the web player.

## Features

-  Displays artist, song title in an MTV-style overlay
-  Easy toggle on/off via extension options

## Screenshots

<img width="2515" height="1907" alt="535969436-d727b18b-b720-488e-b212-c90ae7fc0a5b" src="https://github.com/user-attachments/assets/54810b8a-ade6-4d2e-a2f6-8160041f7d93" />


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

## Usage

1. Open Spotify Web Player (https://open.spotify.com)
2. Play any track or music video
3. The MTV-style overlay will appear in the bottom left corner showing:
   - Artist name
   - Song name 

### Settings

Click the extension icon in your browser toolbar to access settings:

- **Enable Overlay**: Toggle the overlay on/off

- Only works on Spotify Web Player (not the desktop app)

## Technical Details

- **Manifest Version**: 3
- **Permissions**: Storage (for settings)
- **Host Permissions**: open.spotify.com
- Uses MutationObserver to detect track changes

## Troubleshooting

**Overlay not appearing:**
- Make sure the extension is enabled
- Check that you're on open.spotify.com
- Refresh the Spotify page
- Check extension settings (click the extension icon)
- Change to a new track and wait 10 seconds

**Overlay showing wrong information:**
- Spotify's DOM structure occasionally changes
- Try refreshing the page
- Report the issue if it persists

## Future Enhancements

- [ ] Fetch album name, record label and video director info from Spotify API
- [ ] Multiple overlay style themes (MTV, VH1, modern)
- [ ] Position customization
- [ ] Lyrics integration

## License

MIT License - Feel free to modify and distribute

## Contributing

Pull requests welcome!
