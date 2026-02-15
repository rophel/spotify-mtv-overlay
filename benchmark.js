const fs = require('fs');

const metrics = {
    querySelector: 0,
    getBoundingClientRect: 0,
    styleUpdates: 0
};

const mockElement = (name) => {
    const el = {
        id: name,
        className: '',
        innerHTML: '',
        appendChild: () => {},
        remove: () => {},
        style: new Proxy({}, {
            set: (target, prop, value) => {
                metrics.styleUpdates++;
                target[prop] = value;
                return true;
            }
        }),
        classList: {
            classes: new Set(),
            add: function(c) { this.classes.add(c); },
            remove: function(c) { this.classes.delete(c); },
            contains: function(c) { return this.classes.has(c); }
        },
        querySelector: (selector) => {
            metrics.querySelector++;
            if (selector === '.mtv-artist') return artistEl;
            if (selector === '.mtv-song') return songEl;
            return null;
        },
        setAttribute: () => {},
        removeAttribute: () => {},
        videoWidth: 1920,
        videoHeight: 1080,
        getBoundingClientRect: () => {
            metrics.getBoundingClientRect++;
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
        metrics.querySelector++;
        if (selector === 'video') return videoEl;
        if (selector === '[data-testid="context-item-link"]') return { textContent: 'Song' };
        if (selector === '[data-testid="context-item-info-artist"]') return { textContent: 'Artist', trim: () => 'Artist' };
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

// Load content.js and replace let with var to make variables accessible in this scope
const code = fs.readFileSync('content.js', 'utf8').replace(/\blet\b/g, 'var');
eval(code);

// Initial call to createOverlay to set up cached elements
createOverlay();
overlayElement.classList.remove('hidden');
overlayElement.classList.add('visible');

// Reset metrics after initialization
metrics.querySelector = 0;
metrics.getBoundingClientRect = 0;
metrics.styleUpdates = 0;

const iterations = 100;

console.log('--- Optimized Measurement (Same Rect) ---');
for (let i = 0; i < iterations; i++) {
    updateOverlayPosition();
}
console.log(`Iterations: ${iterations}`);
console.log(`querySelector calls: ${metrics.querySelector}`);
console.log(`getBoundingClientRect calls: ${metrics.getBoundingClientRect}`);
console.log(`Style updates: ${metrics.styleUpdates}`);

console.log('\n--- Optimized Measurement (Changing Rect) ---');
metrics.querySelector = 0;
metrics.getBoundingClientRect = 0;
metrics.styleUpdates = 0;
for (let i = 0; i < iterations; i++) {
    // Change rect every time
    const currentI = i;
    videoEl.getBoundingClientRect = () => {
        metrics.getBoundingClientRect++;
        return { width: 1920 + currentI, height: 1080, left: 0, top: 0, bottom: 1080, right: 1920 + currentI };
    };
    updateOverlayPosition();
}
console.log(`Iterations: ${iterations}`);
console.log(`querySelector calls: ${metrics.querySelector}`);
console.log(`getBoundingClientRect calls: ${metrics.getBoundingClientRect}`);
console.log(`Style updates: ${metrics.styleUpdates}`);

console.log('\n--- Optimized Measurement (Hidden Overlay) ---');
overlayElement.classList.add('hidden');
overlayElement.classList.remove('visible');
metrics.querySelector = 0;
metrics.getBoundingClientRect = 0;
metrics.styleUpdates = 0;
for (let i = 0; i < iterations; i++) {
    updateOverlayPosition();
}
console.log(`Iterations: ${iterations}`);
console.log(`querySelector calls: ${metrics.querySelector}`);
console.log(`getBoundingClientRect calls: ${metrics.getBoundingClientRect}`);
console.log(`Style updates: ${metrics.styleUpdates}`);
