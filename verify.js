const fs = require('fs');

// Mock browser environment
global.window = {
  innerHeight: 1080,
  innerWidth: 1920,
};

global.document = {
  body: {
    appendChild: (el) => {
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
          isConnected: true,
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
    sync: { get: (keys, cb) => cb({enabled: true}) },
    onChanged: { addListener: () => {} },
  },
};

global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);
global.setInterval = () => 1;
global.clearInterval = () => {};
global.setTimeout = () => 1;
global.clearTimeout = () => {};

console.log('Loading content.js for verification...');
const contentJs = fs.readFileSync('content.js', 'utf8');

// NOTE: Using eval() here is intended for local testing/verification only.
try {
    eval(contentJs);
} catch (e) {
    console.error('Error loading content.js:', e);
}

console.log('Running verification...');

if (typeof createOverlay === 'function' && !global.overlayElement) {
    createOverlay();
}

if (global.overlayElement) {
    // Simulate visible
    global.overlayElement.classList.add('visible');
    global.overlayElement.classList.remove('hidden');

    updateOverlayPosition();

    const left = parseFloat(global.overlayElement.style.left);
    const bottom = parseFloat(global.overlayElement.style.bottom);

    console.log(`Calculated Position: Left=${left}px, Bottom=${bottom}px`);

    // Expected values for 1920x1080 full fit
    const expectedLeft = 1920 * 0.08; // 153.6
    const expectedBottom = 1080 * 0.22; // 237.6

    if (Math.abs(left - expectedLeft) < 1 && Math.abs(bottom - expectedBottom) < 1) {
        console.log('SUCCESS: Position is correct.');
    } else {
        console.error(`FAILURE: Position incorrect. Expected Left~=${expectedLeft}, Bottom~=${expectedBottom}`);
        process.exit(1);
    }
} else {
    console.error('Overlay element not created');
    process.exit(1);
}
