const { initPopup } = require('./popup');

describe('popup.js', () => {
  let mockDocument;
  let mockChrome;
  let mockCheckbox;
  let mockStatus;
  let eventListeners;

  beforeEach(() => {
    jest.useFakeTimers();
    eventListeners = {};

    mockCheckbox = {
      checked: true,
      addEventListener: jest.fn((event, cb) => {
        eventListeners[event] = cb;
      }),
    };

    mockStatus = {
      classList: {
        add: jest.fn(),
      },
      style: {
        display: 'none',
      },
    };

    mockDocument = {
      getElementById: jest.fn((id) => {
        if (id === 'enabled') return mockCheckbox;
        if (id === 'status') return mockStatus;
        return null;
      }),
    };

    mockChrome = {
      storage: {
        sync: {
          get: jest.fn((keys, callback) => {
            callback({ enabled: true });
          }),
          set: jest.fn((settings, callback) => {
            if (callback) callback();
          }),
        },
      },
    };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should load settings on initialization', () => {
    mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
      callback({ enabled: false });
    });

    initPopup(mockDocument, mockChrome);

    expect(mockChrome.storage.sync.get).toHaveBeenCalledWith(['enabled'], expect.any(Function));
    expect(mockCheckbox.checked).toBe(false);
  });

  test('should default to enabled if no setting is found', () => {
    mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
      callback({});
    });

    initPopup(mockDocument, mockChrome);

    expect(mockCheckbox.checked).toBe(true);
  });

  test('should save settings and show status when checkbox changes', () => {
    initPopup(mockDocument, mockChrome);

    // Simulate checkbox change
    mockCheckbox.checked = false;
    eventListeners['change']();

    expect(mockChrome.storage.sync.set).toHaveBeenCalledWith(
      { enabled: false },
      expect.any(Function)
    );

    expect(mockStatus.classList.add).toHaveBeenCalledWith('success');
    expect(mockStatus.style.display).toBe('block');

    // Fast-forward time to hide status
    jest.advanceTimersByTime(2000);
    expect(mockStatus.style.display).toBe('none');
  });

  test('should not initialize if elements are missing', () => {
    mockDocument.getElementById.mockReturnValue(null);
    initPopup(mockDocument, mockChrome);
    expect(mockChrome.storage.sync.get).not.toHaveBeenCalled();
  });
});
