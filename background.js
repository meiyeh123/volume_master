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