# Volume Booster (Chrome Extension)

A lightweight, powerful Chrome extension that allows you to amplify the volume of any tab's audio up to 500%. This extension is specifically designed to bypass common cross-origin (CORS) restrictions that prevent standard volume boosters from working on certain sites (like Anime1, YouTube iframes, etc.).

## Features

- **Up to 500% Volume Boost:** Amplify audio far beyond the default system limits.
- **Universal Compatibility:** Uses `tabCapture` API to work on all websites, including those using cross-origin iframes.
- **Customizable Keyboard Shortcuts:** Control volume instantly using keyboard commands, perfect for fullscreen mode without needing to open the popup.
- **On-Screen Display (OSD):** Shows a sleek, fade-out volume toast overlay on the webpage when adjusting volume via shortcuts, seamlessly adapting to fullscreen mode.
- **Advanced Customizations:** Configure the volume step size (1%-100%) and a preset volume jump directly from the extension UI.
- **Resource Management:** Includes a "Turn Off / Reset" button and shortcut to instantly release system resources and stop background processes.
- **Clean UI:** Simple, dark-themed slider interface for quick adjustments.
- **Privacy Focused:** Runs entirely locally with no external data transmission.

## Technical Overview

Most volume boosters fail on sites where the video is hosted on a different domain than the website itself (CORS) because the browser's security policy mutes the `AudioContext` when it detects cross-domain manipulation.

This extension solves that by using:
1.  **`tabCapture` API:** Captures the entire audio output of the active tab.
2.  **Offscreen Documents:** Processes the captured audio stream in a background environment (required by Manifest V3).
3.  **GainNode:** Applies a gain multiplier to the stream before sending it back to your speakers.
4.  **Script Injection:** Dynamically injects an intuitive Volume OSD overlay into active frames, solving the common fullscreen-hides-UI issue.

## Installation

Since this is a custom extension, you need to load it manually into your browser:

1.  Open your browser (Chrome, Edge, or any Chromium-based browser).
2.  Go to `chrome://extensions/`.
3.  Enable **"Developer mode"** in the top right corner.
4.  Click **"Load unpacked"**.
5.  Select the `volume_master` folder (where `manifest.json` is located).

## How to Use

### Basic Controls
1.  Click the extension icon in your toolbar.
2.  Move the main slider to increase the volume (100% is normal, 500% is maximum).
3.  You will see a blue icon on your tab indicating that the audio is being captured and processed.
4.  **To stop:** Click the **"Turn Off / Reset"** button to close the background process and return control to the browser, saving memory and CPU.

### Advanced Settings & Shortcuts
Inside the popup UI, you can configure:
- **Preset Shortcut Value:** Set a target volume (e.g., 250%) that you want to jump to instantly.
- **Shortcut Step Size:** Determine how much the volume changes (e.g., 10%) per key press.
- **Customize Shortcuts:** Click the bottom link to open Chrome's native shortcuts manager (`chrome://extensions/shortcuts`) to rebind keys.

**Default Keyboard Shortcuts:**
- **Increase Volume:** `Alt+Shift+Up`
- **Decrease Volume:** `Alt+Shift+Down`
- **Jump to Preset Volume:** `Alt+Shift+P`
- **Turn Off / Reset Volume:** `Alt+Shift+R`
*(Mac users: Use `Option` instead of `Alt`)*

## Security & Privacy

- **Local Processing:** Audio capture and amplification happen entirely within your browser. No audio data is ever recorded, saved, or sent to any server.
- **Visual Indicators:** Chrome automatically displays a "captured" icon on the tab whenever the extension is active, ensuring transparency.
- **Self-Built:** Since you have the source code, you can verify that there are no hidden trackers or malicious scripts.

## File Structure

- `manifest.json`: Extension configuration, permissions, and keyboard commands.
- `popup.html/js`: The user interface and settings sliders.
- `background.js`: Orchestrates the transition between the popup, manages shortcuts, and injects the OSD overlay.
- `offscreen.html/js`: The "engine" that handles the actual Web Audio API processing.

## License

MIT