const fs = require('fs');

const mockElement = (name) => {
    const el = {
        id: name,
        className: '',
        innerHTML: '',
        appendChild: () => {},
        remove: () => {},
        style: {},
        classList: {
            classes: new Set(),
            add: function(c) { this.classes.add(c); },
            remove: function(c) { this.classes.delete(c); },
            contains: function(c) { return this.classes.has(c); }
        },
        querySelector: (selector) => {
            if (selector === '.mtv-artist') return artistEl;
            if (selector === '.mtv-song') return songEl;
            return null;
        },
        setAttribute: () => {},
        removeAttribute: () => {},
        videoWidth: 1920,
        videoHeight: 1080,
        getBoundingClientRect: () => {
            return { width: 1920, height: 1080, left: 0, top: 0, bottom: 1080, right: 1920 };
        }
    };
    return el;
};

const artistEl = mockElement('artist');
const songEl = mockElement('song');
const videoEl = mockElement('video');
const overlayEl = mockElement('overlay');

global.document = {
    querySelector: (selector) => {
        if (selector === 'video') return videoEl;
        return null;
    },
    createElement: () => overlayEl,
    body: {
        appendChild: () => {},
        contains: (el) => true
    },
    addEventListener: () => {}
};

global.window = {
    innerHeight: 1080,
    innerWidth: 1920
};

global.chrome = {
    storage: {
        sync: { get: (keys, cb) => cb({ enabled: true }) },
        onChanged: { addListener: () => {} }
      }
};

global.setInterval = () => {};
global.setTimeout = () => {};
global.requestAnimationFrame = () => {};
global.cancelAnimationFrame = () => {};

const code = fs.readFileSync('content.js', 'utf8').replace(/\blet\b/g, 'var');
eval(code);

createOverlay();
overlayElement.classList.remove('hidden');
overlayElement.classList.add('visible');

console.log('--- Functional Verification ---');

// Case 1: 1920x1080 video in 1920x1080 container (perfect fit)
videoEl.getBoundingClientRect = () => ({ width: 1920, height: 1080, left: 0, top: 0 });
videoEl.videoWidth = 1920;
videoEl.videoHeight = 1080;

updateOverlayPosition();

// videoAspect = 1.77, containerAspect = 1.77
// contentWidth = 1920, contentHeight = 1080, contentLeft = 0, contentTop = 0
// leftPadding = 1920 * 0.08 = 153.6
// bottomPadding = 1080 * 0.22 = 237.6
// left = 0 + 153.6 = 153.6
// contentBottom = 0 + 1080 = 1080
// bottom = 1080 - 1080 + 237.6 = 237.6

console.log(`Overlay Position: left=${overlayEl.style.left}, bottom=${overlayEl.style.bottom}`);
if (overlayEl.style.left === '153.6px' && overlayEl.style.bottom === '237.6px') {
    console.log('✅ Position Correct');
} else {
    console.log('❌ Position Incorrect');
}

// Case 2: Letterboxed (1920x800 video in 1920x1080 container)
videoEl.getBoundingClientRect = () => ({ width: 1920, height: 1080, left: 0, top: 0 });
videoEl.videoWidth = 1920;
videoEl.videoHeight = 800;

updateOverlayPosition();

// videoAspect = 2.4, containerAspect = 1.77
// videoAspect > containerAspect -> Letterboxed
// contentWidth = 1920
// contentHeight = 1920 / 2.4 = 800
// contentLeft = 0
// contentTop = 0 + (1080 - 800) / 2 = 140
// leftPadding = 1920 * 0.08 = 153.6
// bottomPadding = 800 * 0.22 = 176
// left = 0 + 153.6 = 153.6
// contentBottom = 140 + 800 = 940
// bottom = 1080 - 940 + 176 = 316

console.log(`Overlay Position (Letterboxed): left=${overlayEl.style.left}, bottom=${overlayEl.style.bottom}`);
if (overlayEl.style.left === '153.6px' && overlayEl.style.bottom === '316px') {
    console.log('✅ Letterboxed Position Correct');
} else {
    console.log('❌ Letterboxed Position Incorrect');
}
