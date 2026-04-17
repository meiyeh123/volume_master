document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('volumeSlider');
  const volumeValue = document.getElementById('volumeValue');

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
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        function: setVolume,
        args: [multiplier]
      });
    });
  });
});

// This function runs in the context of the webpage
function setVolume(multiplier) {
  window.volumeBooster = window.volumeBooster || {
      connectedElements: new WeakSet(),
      audioCtx: new (window.AudioContext || window.webkitAudioContext)(),
      gainNode: null
  };

  if (!window.volumeBooster.gainNode) {
      window.volumeBooster.gainNode = window.volumeBooster.audioCtx.createGain();
      window.volumeBooster.gainNode.connect(window.volumeBooster.audioCtx.destination);
  }

  window.volumeBooster.gainNode.gain.value = multiplier;

  const mediaElements = document.querySelectorAll('video, audio');
  mediaElements.forEach(media => {
      if (!window.volumeBooster.connectedElements.has(media)) {
          try {
              const source = window.volumeBooster.audioCtx.createMediaElementSource(media);
              source.connect(window.volumeBooster.gainNode);
              window.volumeBooster.connectedElements.add(media);
          } catch (e) {
              console.log("Volume Booster: Error connecting media element. It might already be connected.", e);
          }
      }
  });
}