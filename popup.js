document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('volumeSlider');
  const volumeValue = document.getElementById('volumeValue');
  const stopButton = document.getElementById('stopButton');
  const presetSlider = document.getElementById('presetSlider');
  const presetValue = document.getElementById('presetValue');
  const stepSlider = document.getElementById('stepSlider');
  const stepValue = document.getElementById('stepValue');
  const shortcutsLink = document.getElementById('shortcutsLink');

  // Load saved volume state
  chrome.storage.local.get(['volumeMultiplier', 'presetMultiplier', 'stepMultiplier'], function(result) {
    if (result.volumeMultiplier) {
      const val = Math.round(result.volumeMultiplier * 100);
      slider.value = val;
      volumeValue.textContent = val;
    }
    if (result.presetMultiplier) {
      const val = Math.round(result.presetMultiplier * 100);
      presetSlider.value = val;
      presetValue.textContent = val;
    }
    if (result.stepMultiplier) {
      const val = Math.round(result.stepMultiplier * 100);
      stepSlider.value = val;
      stepValue.textContent = val;
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

  presetSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    presetValue.textContent = val;
    chrome.storage.local.set({presetMultiplier: val / 100});
  });

  stepSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    stepValue.textContent = val;
    chrome.storage.local.set({stepMultiplier: val / 100});
  });

  shortcutsLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
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