// Popup Settings Script - V1

document.addEventListener('DOMContentLoaded', function () {
  const enabledCheckbox = document.getElementById('enabled');
  const status = document.getElementById('status');

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
});
