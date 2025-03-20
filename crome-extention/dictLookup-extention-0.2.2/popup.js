let isEnabled = true;

chrome.storage.local.get(['isEnabled'], (result) => {
  isEnabled = result.isEnabled !== undefined ? result.isEnabled : true;
  updateButton();
});

document.getElementById('toggleButton').addEventListener('click', () => {
  isEnabled = !isEnabled;
  chrome.storage.local.set({ isEnabled });
  updateButton();
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      // Check if the tab URL is not a chrome:// URL (system URL)
      const tab = tabs[0];
      if (tab.url && !tab.url.startsWith('chrome://')) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (isEnabled) => {
            const popup = document.querySelector('.popup');
            const overlay = document.querySelector('.overlay');
            if (popup && overlay) {
              popup.style.display = isEnabled ? 'block' : 'none';
              overlay.style.display = isEnabled ? 'block' : 'none';
            }
          },
          args: [isEnabled]
        });
      }
    }
  });
});

function updateButton() {
  const button = document.getElementById('toggleButton');
  button.textContent = isEnabled ? 'Disable' : 'Enable';
}
