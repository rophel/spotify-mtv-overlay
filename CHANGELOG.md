# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-02-16

### Added
- Album, Label, and Director information to the MTV-style overlay (PR #6)
- MusicBrainz API integration for fetching album and label metadata
- IMVDb API integration for fetching music video director information
- Unit tests for popup.js settings logic (PR #5)
- Background service worker for API requests and metadata processing

### Fixed
- Resource leak in startTracking and startPositionTracking functions (PR #4)
- Improved cleanup of interval and timeout IDs
- Added idempotency to tracking functions to prevent multiple concurrent timers

### Changed
- Updated manifest.json to Manifest v3 with background service worker
- Added host permissions for MusicBrainz and IMVDb APIs
- Improved resource management and lifecycle cleanup

## [1.0.0] - 2026-01-14

### Added
- Initial release with MTV-style artist/song overlay
- Overlay appears 8 seconds after track change
- Dynamic positioning relative to video content (handles letterboxing/pillarboxing)
- Responsive font sizing that scales with video height
- Condensed font styling with strong drop shadow
- Only shows in video mode (fullscreen or expanded view)
- Enable/disable toggle via extension options
