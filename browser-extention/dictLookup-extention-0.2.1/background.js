let isEnabled = true;

chrome.action.onClicked.addListener((tab) => {
  isEnabled = !isEnabled;
  updateExtensionState(tab);
});

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

function updateExtensionState(tab) {
  if (isEnabled) {
    chrome.action.setIcon({ path: "icon.png", tabId: tab.id });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
  } else {
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