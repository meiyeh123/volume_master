let capturingTabId = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'set-volume') {
    handleVolumeChange(message.multiplier, message.tabId).catch(console.error);
    sendResponse({ status: 'processing' });
  } else if (message.type === 'stop-capture') {
    stopCapture(message.tabId).catch(console.error);
    sendResponse({ status: 'stopped' });
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tabs[0]) return;
  const tabId = tabs[0].id;

  if (command === 'volume-reset') {
    await stopCapture(tabId);
    await chrome.storage.local.set({ volumeMultiplier: 1.0 });
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId, allFrames: true },
        func: showVolumeToast,
        args: ["Off / 100"]
      });
    } catch (err) {}
    return;
  }

  const result = await chrome.storage.local.get(['volumeMultiplier', 'presetMultiplier', 'stepMultiplier']);
  let multiplier = result.volumeMultiplier || 1.0;
  let step = result.stepMultiplier || 0.1;

  if (command === 'volume-up') {
    multiplier = Math.min(multiplier + step, 5.0);
  } else if (command === 'volume-down') {
    multiplier = Math.max(multiplier - step, 0.0);
  } else if (command === 'volume-preset') {
    multiplier = result.presetMultiplier || 2.0; // Default to 200% if not set
  }

  // Handle floating point math issues
  multiplier = Math.round(multiplier * 100) / 100;

  await chrome.storage.local.set({ volumeMultiplier: multiplier });
  await handleVolumeChange(multiplier, tabId);

  // Show UI overlay
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId, allFrames: true },
      func: showVolumeToast,
      args: [Math.round(multiplier * 100)]
    });
  } catch (err) {
    console.log("Could not inject volume toast overlay", err);
  }
});

async function stopCapture(tabId) {
  if (capturingTabId === tabId) {
    if (await chrome.offscreen.hasDocument()) {
      await chrome.offscreen.closeDocument();
    }
    capturingTabId = null;
  }
}

async function handleVolumeChange(multiplier, tabId) {
  if (capturingTabId !== tabId) {
    // We are starting capture for a new tab
    const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tabId });

    if (!(await chrome.offscreen.hasDocument())) {
      await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['USER_MEDIA'],
        justification: 'Capture tab audio to boost volume'
      });
    }

    chrome.runtime.sendMessage({
      type: 'start-capture',
      target: 'offscreen',
      streamId: streamId,
      multiplier: multiplier
    });

    capturingTabId = tabId;
  } else {
    // Already capturing this tab, just update volume
    chrome.runtime.sendMessage({
      type: 'update-volume',
      target: 'offscreen',
      multiplier: multiplier
    });
  }
}

function showVolumeToast(volume) {
  let toast = document.getElementById('volume-booster-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'volume-booster-toast';
    toast.style.cssText = `
      position: fixed;
      top: 10%;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 0, 0, 0.8);
      color: #fff;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-weight: bold;
      z-index: 2147483647;
      pointer-events: none;
      transition: opacity 0.3s ease-in-out;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      text-align: center;
    `;
  }
  
  // Attach to fullscreen container if it exists, otherwise body
  let container = document.fullscreenElement || document.body;
  
  // If the fullscreen element is a video or iframe, we must append to its parent
  // because you cannot append a div inside a video tag.
  if (container.nodeName === 'VIDEO' || container.nodeName === 'IFRAME') {
    container = container.parentElement || document.body;
  }

  if (toast.parentElement !== container) {
    if (toast.parentElement) toast.parentElement.removeChild(toast);
    container.appendChild(toast);
  }
  
  toast.textContent = `Volume: ${volume}%`;
  toast.style.opacity = '1';
  
  if (window.volumeBoosterToastTimeout) {
    clearTimeout(window.volumeBoosterToastTimeout);
  }
  
  window.volumeBoosterToastTimeout = setTimeout(() => {
    toast.style.opacity = '0';
  }, 1500);
}