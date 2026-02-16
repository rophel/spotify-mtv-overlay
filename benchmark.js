const fs = require('fs');

// Mock browser environment
global.window = {
  innerHeight: 1080,
  innerWidth: 1920,
};

global.document = {
  body: {
    appendChild: (el) => {
        // Simple way to track the created element in global scope for testing
        global.overlayElement = el;
        el.isConnected = true;
    },
    contains: () => true,
  },
  createElement: (tag) => {
    return {
      tagName: tag.toUpperCase(),
      id: '',
      className: '',
      style: {},
      classList: {
          add: function(c) {
              if (!this.className) this.className = '';
              if (!this.className.includes(c)) this.className += ' ' + c;
          },
          remove: function(c) {
               if (this.className) this.className = this.className.replace(c, '').trim();
          },
          contains: function(c) { return this.className && this.className.includes(c) }
      },
      querySelector: (sel) => ({ style: {}, textContent: '' }), // Mock children
      innerHTML: '',
      setAttribute: (k, v) => {},
      removeAttribute: (k) => {},
      remove: () => {},
      isConnected: true
    };
  },
  querySelector: (sel) => {
    if (sel === 'video') {
       return {
          getBoundingClientRect: () => ({ top: 0, left: 0, width: 1920, height: 1080 }),
          videoWidth: 1920,
          videoHeight: 1080,
          isConnected: true, // For new check
          tagName: 'VIDEO'
       };
    }
    return null;
  },
  fullscreenElement: null,
  addEventListener: () => {},
};

global.chrome = {
  storage: {
    sync: { get: (keys, cb) => {
        if (cb) cb({enabled: true});
    } },
    onChanged: { addListener: () => {} },
  },
};

global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);
global.setInterval = () => 1;
global.clearInterval = () => {};
global.setTimeout = () => 1;
global.clearTimeout = () => {};

console.log('Loading content.js for benchmarking...');
const contentJs = fs.readFileSync('content.js', 'utf8');

// NOTE: Using eval() here is intended for local testing/benchmarking only so that the
// content script can run in this mocked environment. This pattern MUST NOT be used in
// production code, as executing code via eval() is unsafe and makes debugging harder.
try {
    eval(contentJs);
} catch (e) {
    console.error('Error loading content.js:', e);
}

console.log('Running benchmark...');

// Ensure overlay is created (init runs via chrome.storage callback)
if (typeof createOverlay === 'function' && !global.overlayElement) {
    createOverlay();
}

if (global.overlayElement) {
    // Simulate visible
    global.overlayElement.classList.add('visible');
    global.overlayElement.classList.remove('hidden');

    // Run updateOverlayPosition multiple times
    const iterations = 10000;
    const start = process.hrtime();

    for (let i = 0; i < iterations; i++) {
        if (typeof updateOverlayPosition === 'function') {
            updateOverlayPosition();
        }
    }

    const end = process.hrtime(start);
    const duration = (end[0] * 1000 + end[1] / 1e6).toFixed(2);

    console.log(`Ran ${iterations} iterations in ${duration}ms`);
    console.log(`Average time per iteration: ${(duration / iterations).toFixed(4)}ms`);
} else {
    console.error('Overlay element not created');
}
