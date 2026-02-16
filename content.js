// Spotify MTV Overlay Content Script - V1

let overlayElement = null;
let lastTrackKey = '';
let showTimeout = null;
let hideTimeout = null;
let trackingInterval = null;
let initialTrackingTimeout = null;
let positionInterval = null;
let isEnabled = true;

// Caching variables for performance
let animationFrameId = null;
let cachedVideoElement = null;
let cachedArtistEl = null;
let cachedSongEl = null;
let lastVideoRect = null;

// Timing constants (in milliseconds)
const DELAY_BEFORE_SHOW = 8000;  // 8 seconds after track change
const FADE_DURATION = 500;       // 0.5 second fade
const VISIBLE_DURATION = 3000;   // 3 seconds visible

// Initialize settings
chrome.storage.sync.get(['enabled'], function (result) {
  isEnabled = result.enabled !== false;
  if (isEnabled) {
    init();
  }
});

// Listen for settings changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.enabled) {
    isEnabled = changes.enabled.newValue;
    if (isEnabled) {
      init();
    } else {
      removeOverlay();
    }
  }
});

function init() {
  console.log('Spotify MTV Overlay V1 initialized');
  createOverlay();
  startTracking();
}

function createOverlay() {
  if (overlayElement) return;

  overlayElement = document.createElement('div');
  overlayElement.id = 'spotify-mtv-overlay';
  overlayElement.className = 'mtv-overlay hidden';
  overlayElement.innerHTML = `
    <div class="mtv-overlay-content">
      <div class="mtv-artist"></div>
      <div class="mtv-song"></div>
    </div>
  `;

  document.body.appendChild(overlayElement);

  // Cache elements immediately
  cachedArtistEl = overlayElement.querySelector('.mtv-artist');
  cachedSongEl = overlayElement.querySelector('.mtv-song');

  // Position tracking will start when overlay is shown
}

function startPositionTracking() {
  if (positionInterval) {
    clearInterval(positionInterval);
    positionInterval = null;
  }

  // Use requestAnimationFrame for smoother updates synchronized with screen refresh
  if (animationFrameId) return;

  function loop() {
    updateOverlayPosition();
    animationFrameId = requestAnimationFrame(loop);
  }
  animationFrameId = requestAnimationFrame(loop);
}

function stopPositionTracking() {
  if (positionInterval) {
    clearInterval(positionInterval);
    positionInterval = null;
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function updateOverlayPosition() {
  // Early exit if overlay is hidden or missing
  if (!overlayElement || overlayElement.classList.contains('hidden')) return;

  // Check if cached video element is still valid
  // Using isConnected is more performant than document.body.contains
  if (!cachedVideoElement || !cachedVideoElement.isConnected) {
    cachedVideoElement = document.querySelector('video');
    // Reset state when video element changes
    lastVideoRect = null;
  }

  if (!cachedVideoElement) return;

  const rect = cachedVideoElement.getBoundingClientRect();

  // Only update if video is reasonably sized (in video mode)
  if (rect.width < 400 || rect.height < 300) return;

  // Calculate actual video content bounds (excluding letterbox/pillarbox black bars)
  const videoNaturalWidth = cachedVideoElement.videoWidth;
  const videoNaturalHeight = cachedVideoElement.videoHeight;

  if (!videoNaturalWidth || !videoNaturalHeight) return;

  // Check if anything has changed since last update to avoid layout thrashing
  // Use epsilon for floating point comparisons
  const EPSILON = 0.5;
  if (lastVideoRect &&
      Math.abs(lastVideoRect.top - rect.top) < EPSILON &&
      Math.abs(lastVideoRect.left - rect.left) < EPSILON &&
      Math.abs(lastVideoRect.width - rect.width) < EPSILON &&
      Math.abs(lastVideoRect.height - rect.height) < EPSILON &&
      lastVideoRect.videoWidth === videoNaturalWidth &&
      lastVideoRect.videoHeight === videoNaturalHeight &&
      lastVideoRect.windowHeight === window.innerHeight) {
    return;
  }

  // Update last known state
  lastVideoRect = {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    videoWidth: videoNaturalWidth,
    videoHeight: videoNaturalHeight,
    windowHeight: window.innerHeight
  };

  const videoAspect = videoNaturalWidth / videoNaturalHeight;
  const containerAspect = rect.width / rect.height;

  let contentLeft, contentTop, contentWidth, contentHeight;

  if (videoAspect > containerAspect) {
    // Video is wider than container - letterboxed (black bars top/bottom)
    contentWidth = rect.width;
    contentHeight = rect.width / videoAspect;
    contentLeft = rect.left;
    contentTop = rect.top + (rect.height - contentHeight) / 2;
  } else {
    // Video is taller than container - pillarboxed (black bars left/right)
    contentHeight = rect.height;
    contentWidth = rect.height * videoAspect;
    contentTop = rect.top;
    contentLeft = rect.left + (rect.width - contentWidth) / 2;
  }

  // Position relative to actual video content bounds
  // Left: 8% of content width from left edge (MTV2 style)
  // Bottom: 22% of content height from bottom edge
  const leftPadding = contentWidth * 0.08;
  const bottomPadding = contentHeight * 0.22;

  const left = contentLeft + leftPadding;
  const contentBottom = contentTop + contentHeight;
  const bottom = window.innerHeight - contentBottom + bottomPadding;

  overlayElement.style.left = `${left}px`;
  overlayElement.style.bottom = `${bottom}px`;

  // Scale font size based on video content height (consistent across resolutions)
  // Artist: ~5.5% of video height, Song: ~5% of video height
  const artistFontSize = Math.round(contentHeight * 0.055);
  const songFontSize = Math.round(contentHeight * 0.05);

  if (cachedArtistEl) cachedArtistEl.style.fontSize = `${artistFontSize}px`;
  if (cachedSongEl) cachedSongEl.style.fontSize = `${songFontSize}px`;
}

function removeOverlay() {
  clearAllTimeouts();
  stopAllTracking();
  if (overlayElement) {
    overlayElement.remove();
    overlayElement = null;
  }

  // Clear cached references
  cachedVideoElement = null;
  cachedArtistEl = null;
  cachedSongEl = null;
  lastVideoRect = null;
}

function clearAllTimeouts() {
  if (showTimeout) {
    clearTimeout(showTimeout);
    showTimeout = null;
  }
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
}

function stopAllTracking() {
  if (trackingInterval) {
    clearInterval(trackingInterval);
    trackingInterval = null;
  }
  if (initialTrackingTimeout) {
    clearTimeout(initialTrackingTimeout);
    initialTrackingTimeout = null;
  }
  stopPositionTracking();
}

// Check if in fullscreen or expanded "Now Playing" view
function isInVideoMode() {
  // Check for browser fullscreen
  if (document.fullscreenElement) {
    if (overlayElement) overlayElement.setAttribute('data-fullscreen', 'true');
    return true;
  }

  // Check for Spotify's "Expand Now Playing" view
  // This view has a specific structure - the main content area shows the video
  const expandedViewIndicators = [
    // The video player takes up the main content area
    '[data-testid="video-player"]',
    // Or look for the Cinema mode / expanded player container
    '.Root__now-playing-bar',
  ];

  // Check if there's a large video element visible
  const videoElement = document.querySelector('video');
  if (videoElement) {
    const rect = videoElement.getBoundingClientRect();
    // If video is larger than 400x300, consider it "expanded"
    if (rect.width > 400 && rect.height > 300) {
      if (overlayElement) {
        overlayElement.setAttribute('data-expanded', 'true');
        overlayElement.removeAttribute('data-fullscreen');
      }
      return true;
    }
  }

  // Check for fullscreen-like container
  const fullscreenContainer = document.querySelector('[data-testid="fullscreen-mode"]') ||
    document.querySelector('[data-testid="cinema-mode"]');
  if (fullscreenContainer) {
    if (overlayElement) overlayElement.setAttribute('data-expanded', 'true');
    return true;
  }

  // Not in video mode
  if (overlayElement) {
    overlayElement.removeAttribute('data-fullscreen');
    overlayElement.removeAttribute('data-expanded');
  }
  return false;
}

function cleanText(text) {
  if (!text) return '';
  return text.replace(/\s*\(remastered[^)]*\)/gi, '')
    .replace(/\s*remastered\s*/gi, '')
    .replace(/\s*-\s*\d{4}\s*(remaster|mix|version)?\s*/gi, '')
    .trim();
}

function getCurrentTrackInfo() {
  let artist = '';
  let song = '';

  // Get current track link (song title)
  const trackLink = document.querySelector('[data-testid="context-item-link"]');
  if (trackLink) {
    song = cleanText(trackLink.textContent);
  }

  // Get artist - try multiple selectors
  const artistSelectors = [
    '[data-testid="context-item-info-artist"]',
    '[data-testid="context-item-link-artist"]',
    'a[href*="/artist/"]'
  ];

  for (const selector of artistSelectors) {
    const artistElement = document.querySelector(selector);
    if (artistElement && artistElement.textContent.trim()) {
      artist = artistElement.textContent.trim();
      break;
    }
  }

  return { artist, song };
}

function updateOverlayContent(trackInfo) {
  if (!overlayElement) return;

  if (cachedArtistEl) cachedArtistEl.textContent = trackInfo.artist || '';
  if (cachedSongEl) cachedSongEl.textContent = trackInfo.song ? `"${trackInfo.song}"` : '';
}

function scheduleOverlay(trackInfo) {
  if (!isEnabled || !overlayElement) return;

  // Clear any pending timeouts
  clearAllTimeouts();

  // Hide immediately if currently visible
  overlayElement.classList.remove('visible');
  overlayElement.classList.add('hidden');
  stopPositionTracking();

  console.log('Track changed, scheduling overlay:', trackInfo);

  // Schedule show at 8 seconds
  showTimeout = setTimeout(() => {
    // Check if still in video mode before showing
    if (!isInVideoMode()) {
      console.log('Not in video mode, skipping overlay');
      return;
    }

    updateOverlayContent(trackInfo);
    overlayElement.classList.remove('hidden');
    overlayElement.classList.add('visible');

    // Start tracking position when visible
    startPositionTracking();

    console.log('Showing overlay');

    // Schedule hide after 3 seconds
    hideTimeout = setTimeout(() => {
      overlayElement.classList.remove('visible');
      overlayElement.classList.add('hidden');

      // Stop tracking position when hidden
      stopPositionTracking();

      console.log('Hiding overlay');
    }, VISIBLE_DURATION);

  }, DELAY_BEFORE_SHOW);
}

function startTracking() {
  if (trackingInterval) clearInterval(trackingInterval);
  if (initialTrackingTimeout) clearTimeout(initialTrackingTimeout);

  // Check for track changes every second
  trackingInterval = setInterval(() => {
    const trackInfo = getCurrentTrackInfo();
    const trackKey = `${trackInfo.artist}|${trackInfo.song}`;

    if (trackInfo.artist && trackInfo.song && trackKey !== lastTrackKey) {
      console.log('Track changed:', trackInfo);
      lastTrackKey = trackKey;
      scheduleOverlay(trackInfo);
    }
  }, 1000);

  // Initial check after 2 seconds
  initialTrackingTimeout = setTimeout(() => {
    const trackInfo = getCurrentTrackInfo();
    if (trackInfo.artist && trackInfo.song) {
      lastTrackKey = `${trackInfo.artist}|${trackInfo.song}`;
      scheduleOverlay(trackInfo);
    }
  }, 2000);
}

// Listen for fullscreen changes
document.addEventListener('fullscreenchange', () => {
  console.log('Fullscreen changed:', !!document.fullscreenElement);
  // If entering fullscreen and we have track info, reschedule overlay
  if (document.fullscreenElement && lastTrackKey) {
    const trackInfo = getCurrentTrackInfo();
    if (trackInfo.artist && trackInfo.song) {
      scheduleOverlay(trackInfo);
    }
  }
});
