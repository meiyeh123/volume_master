document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('volumeSlider');
  const volumeValue = document.getElementById('volumeValue');
  const stopButton = document.getElementById('stopButton');

  // Load saved volume state
  chrome.storage.local.get(['volumeMultiplier'], function(result) {
    if (result.volumeMultiplier) {
      const val = Math.round(result.volumeMultiplier * 100);
      slider.value = val;
      volumeValue.textContent = val;
    }
  });

  slider.addEventListener('input', (e) => {
    const val = e.target.value;
    volumeValue.textContent = val;
    const multiplier = val / 100;
    
    // Save state
    chrome.storage.local.set({volumeMultiplier: multiplier});

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.runtime.sendMessage({
        type: 'set-volume',
        multiplier: multiplier,
        tabId: tabs[0].id
      });
    });
  });

  stopButton.addEventListener('click', () => {
    // Reset UI and storage
    slider.value = 100;
    volumeValue.textContent = 100;
    chrome.storage.local.set({volumeMultiplier: 1});

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.runtime.sendMessage({
        type: 'stop-capture',
        tabId: tabs[0].id
      });
    });
  });
});