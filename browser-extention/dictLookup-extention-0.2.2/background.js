let isEnabled = true;

// Определяем API браузера (Chrome или Edge)
const browserAPI = self.chrome || self.browser;

// Загружаем сохраненное состояние расширения из хранилища
browserAPI.storage.local.get(['isEnabled'], (result) => {
  isEnabled = result.isEnabled !== undefined ? result.isEnabled : true;
  updateIcon();
});

// Обработчик клика по значку расширения
browserAPI.action.onClicked.addListener((tab) => {
  isEnabled = !isEnabled;
  browserAPI.storage.local.set({ isEnabled });
  updateExtensionState(tab);
});

// Обработчик горячей клавиши
browserAPI.commands.onCommand.addListener((command) => {
  if (command === 'toggle_extension') {
    browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        isEnabled = !isEnabled;
        browserAPI.storage.local.set({ isEnabled });
        updateExtensionState(tabs[0]);
      }
    });
  }
});

// Функция обновления состояния расширения
function updateExtensionState(tab) {
  if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('edge://')) {
    updateIcon();

    if (isEnabled) {
      // Запускаем content.js
      executeScript(tab.id, { files: ['content.js'] });
    } else {
      // Выключаем попап на странице
      executeScript(tab.id, { func: disablePopup });
    }
  }
}

// Функция обновления иконки расширения
function updateIcon() {
  const iconPath = isEnabled ? "icon.png" : "icon_disabled.png";
  browserAPI.action.setIcon({ path: iconPath });
  browserAPI.action.setBadgeText({ text: isEnabled ? "ON" : "OFF" });
  browserAPI.action.setBadgeBackgroundColor({ color: isEnabled ? "#4CAF50" : "#B71C1C" });
}

// Функция выполнения скрипта (универсальная для Chrome и Edge)
function executeScript(tabId, scriptDetails) {
  if (browserAPI.scripting && browserAPI.scripting.executeScript) {
    browserAPI.scripting.executeScript({
      target: { tabId },
      ...scriptDetails
    });
  } else {
    if (scriptDetails.files) {
      browserAPI.tabs.executeScript(tabId, { file: scriptDetails.files[0] });
    } else if (scriptDetails.func) {
      browserAPI.tabs.executeScript(tabId, { code: `(${scriptDetails.func.toString()})()` });
    }
  }
}

// Функция отключения попапа (выполняется в контексте страницы)
function disablePopup() {
  const popup = document.querySelector('.popup');
  const overlay = document.querySelector('.overlay');
  if (popup && overlay) {
    popup.style.display = 'none';
    overlay.style.display = 'none';
  }
}
