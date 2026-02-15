// Background Service Worker for Spotify MTV Overlay

// Listen for messages from content script
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'FETCH_METADATA') {
      fetchMetadata(request.artist, request.song)
        .then(data => sendResponse(data))
        .catch(error => {
          console.error('Error fetching metadata:', error);
          sendResponse({ error: error.message });
        });
      return true; // Indicates async response
    }
  });
}

async function fetchMetadata(artist, song) {
  const data = {
    album: '',
    label: '',
    director: ''
  };

  try {
    // Parallel fetch attempts
    const [mbData, director] = await Promise.allSettled([
      fetchMusicBrainzData(artist, song),
      fetchIMVDbDirector(artist, song)
    ]);

    if (mbData.status === 'fulfilled' && mbData.value) {
      data.album = mbData.value.album || '';
      data.label = mbData.value.label || '';
    }

    if (director.status === 'fulfilled' && director.value) {
      data.director = director.value || '';
    }

  } catch (err) {
    console.error('Metadata fetch critical failure', err);
  }

  return data;
}

async function fetchMusicBrainzData(artist, song) {
  try {
    // MusicBrainz Search
    // Note: Remove "Remastered" etc from song title for better search results is usually handled by content script
    // but we might want to do it here too if needed.
    // content.js sends "clean" text usually.

    // Escape quotes for Lucene query syntax
    const safeArtist = artist.replace(/"/g, '\\"');
    const safeSong = song.replace(/"/g, '\\"');
    const query = `artist:"${safeArtist}" AND recording:"${safeSong}"`;
    const searchUrl = `https://musicbrainz.org/ws/2/recording?query=${encodeURIComponent(query)}&fmt=json`;

    const response = await fetch(searchUrl, {
        headers: { 'User-Agent': 'SpotifyMTVOverlay/1.0 ( https://github.com/myuser/spotify-mtv-overlay )' }
    });

    if (!response.ok) return null;

    const json = await response.json();

    if (json.recordings && json.recordings.length > 0) {
        // Find best match: prefer recordings that are on a "Release" (Album/Single)
        // Sort recordings by first-release-date to prioritize original versions over live/compilations
        const candidates = json.recordings.filter(r => r.releases && r.releases.length > 0);

        if (candidates.length > 0) {
            // Helper to find earliest date for a recording
            const getEarliestDate = (rec) => {
                if (rec['first-release-date']) return rec['first-release-date'];
                if (rec.releases && rec.releases.length > 0) {
                    // Find min date among releases
                    const dates = rec.releases.map(r => r.date || '9999').sort();
                    return dates[0];
                }
                return '9999';
            };

            candidates.sort((a, b) => {
                return getEarliestDate(a).localeCompare(getEarliestDate(b));
            });

            const recording = candidates[0];

            if (recording && recording.releases && recording.releases.length > 0) {
                // Sort releases by date to find the original
                const sortedReleases = recording.releases.sort((a, b) => {
                    const dateA = a.date || '9999-12-31';
                    const dateB = b.date || '9999-12-31';
                    return dateA.localeCompare(dateB);
                });

                // Prefer albums over singles if dates are close?
                // For now, just take the earliest one.
                const release = sortedReleases[0];
                const album = release.title;
                const releaseId = release.id;

            let label = '';

            // Fetch release details to get the label
            const releaseUrl = `https://musicbrainz.org/ws/2/release/${releaseId}?inc=labels&fmt=json`;
            const releaseResp = await fetch(releaseUrl, {
                 headers: { 'User-Agent': 'SpotifyMTVOverlay/1.0 ( https://github.com/myuser/spotify-mtv-overlay )' }
            });

            if (releaseResp.ok) {
                const releaseJson = await releaseResp.json();
                if (releaseJson['label-info'] && releaseJson['label-info'].length > 0) {
                    // Get the first label
                    if (releaseJson['label-info'][0].label) {
                        label = releaseJson['label-info'][0].label.name;
                    }
                }
            }

            return { album, label };
        }
    }
    }
  } catch (e) {
    console.error('MusicBrainz error', e);
  }
  return null;
}

async function fetchIMVDbDirector(artist, song) {
    try {
        const searchUrl = `https://imvdb.com/api/v1/search/videos?q=${encodeURIComponent(artist + ' ' + song)}`;
        const response = await fetch(searchUrl);

        if (!response.ok) return '';

        const json = await response.json();

        if (json.results && json.results.length > 0) {
            // Get the first result
            const videoId = json.results[0].id;
            const videoUrl = `https://imvdb.com/api/v1/video/${videoId}?include=credits`;
            const videoResp = await fetch(videoUrl);

            if (videoResp.ok) {
                const videoJson = await videoResp.json();
                if (videoJson.directors && videoJson.directors.length > 0) {
                    return videoJson.directors.map(d => d.entity_name).join(', ');
                }
            }
        }
    } catch (e) {
        console.error('IMVDb error', e);
    }
    return '';
}

// Export for testing in Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { fetchMetadata };
}
