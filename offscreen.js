let audioCtx;
let gainNode;
let source;

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.target !== 'offscreen') return;

  if (message.type === 'start-capture') {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          mandatory: {
            chromeMediaSource: 'tab',
            chromeMediaSourceId: message.streamId
          }
        }
      });

      if (!audioCtx) {
        audioCtx = new AudioContext();
      }

      // Disconnect previous nodes if capturing a new tab
      if (source) {
        source.disconnect();
      }
      if (gainNode) {
        gainNode.disconnect();
      }

      source = audioCtx.createMediaStreamSource(stream);
      gainNode = audioCtx.createGain();
      
      gainNode.gain.value = message.multiplier;

      source.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      // Cleanup when stream ends (e.g. tab closed)
      stream.getTracks()[0].onended = () => {
        if (source) source.disconnect();
        if (gainNode) gainNode.disconnect();
        source = null;
        gainNode = null;
      };
    } catch (e) {
      console.error("Failed to capture tab audio:", e);
    }
  } else if (message.type === 'update-volume') {
    if (gainNode) {
      gainNode.gain.value = message.multiplier;
    }
  }
});