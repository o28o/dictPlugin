let isEnabled = true;

// Toggle the extension state when the icon is clicked
chrome.action.onClicked.addListener((tab) => {
  isEnabled = !isEnabled;
  updateExtensionState(tab);
});

// Listen for the keyboard shortcut command to toggle the extension state
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle_extension') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        isEnabled = !isEnabled;
        updateExtensionState(tabs[0]);
      }
    });
  }
});

// Update the extension state based on whether it's enabled or disabled
function updateExtensionState(tab) {
  // Ensure that the tab URL is not a chrome:// URL (system URL)
  if (tab.url && !tab.url.startsWith('chrome://')) {
    if (isEnabled) {
      // Change icon to active state and run the content script
      chrome.action.setIcon({ path: "icon.png", tabId: tab.id });
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
    } else {
      // Change icon to disabled state and remove the content
      chrome.action.setIcon({ path: "icon_disabled.png", tabId: tab.id });
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const popup = document.querySelector('.popup');
          const overlay = document.querySelector('.overlay');
          if (popup && overlay) {
            popup.style.display = 'none';
            overlay.style.display = 'none';
          }
        }
      });
    }
  }
}
