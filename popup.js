// Popup Settings Script - V1

function initPopup(document, chrome) {
  const enabledCheckbox = document.getElementById('enabled');
  const status = document.getElementById('status');

  if (!enabledCheckbox || !status) return;

  // Load saved settings
  chrome.storage.sync.get(['enabled'], function (result) {
    enabledCheckbox.checked = result.enabled !== false;
  });

  // Save settings on change
  function saveSettings() {
    const settings = {
      enabled: enabledCheckbox.checked
    };

    chrome.storage.sync.set(settings, function () {
      // Show success message
      status.classList.add('success');
      status.style.display = 'block';
      setTimeout(() => {
        status.style.display = 'none';
      }, 2000);
    });
  }

  enabledCheckbox.addEventListener('change', saveSettings);
}

// Initialize if in browser environment
if (typeof document !== 'undefined' && typeof chrome !== 'undefined' && chrome.storage) {
  document.addEventListener('DOMContentLoaded', () => {
    initPopup(document, chrome);
  });
}

// Export for testing
if (typeof module !== 'undefined') {
  module.exports = { initPopup };
}
