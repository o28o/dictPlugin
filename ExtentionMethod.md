Adding Pali Lookup to any site, works for any browser that supports custom js extentions. Chrome, Edge, Brave.

1. Install one of the custom js extentions of your choice: eg Violentmonkey, Tampermonkey, ScriptCat
2. create a custom script with following text, header might vary this code is suitable for Tampermonkey and ScriptCat without changes
3. enable the plugin, enable the custom script.
4. Open or refresh page and click the desired word. Enjoy.


   ## Code to paste
```
// ==UserScript==
// @name         dict.dhamma.gift lookup
// @namespace    https://dhamma.gift/
// @version      2025-03-18
// @description  on click Pali Lookup
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

   // const dpdlang = 'https://dict.dhamma.gift/?q=';
   const dpdlang = 'https://dict.dhamma.gift/gd?search=';

    const storageKey = 'dictPopupSize';

    function createPopup() {
        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '99999';
        overlay.style.display = 'none';

        const popup = document.createElement('div');
        popup.classList.add('popup');
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.width = '80%';
        popup.style.height = '80%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.background = 'white';
        popup.style.border = '2px solid #666';
        popup.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        popup.style.zIndex = '100000';
        popup.style.display = 'none';
        popup.style.resize = 'both';
        popup.style.overflow = 'hidden';

        const closeBtn = document.createElement('button');
        closeBtn.classList.add('close-btn');
        closeBtn.textContent = '×';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '10px';
        closeBtn.style.border = 'none';
        closeBtn.style.background = '#CE0520';
        closeBtn.style.color = 'white';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.width = '30px';
        closeBtn.style.height = '30px';
        closeBtn.style.borderRadius = '50%';

        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';

        popup.appendChild(closeBtn);
        popup.appendChild(iframe);
        document.body.appendChild(overlay);
        document.body.appendChild(popup);

        function closePopup() {
            popup.style.display = 'none';
            overlay.style.display = 'none';
            iframe.src = '';
        }

// Закрытие popup при нажатии на кнопку или на overlay
closeBtn.addEventListener('click', () => {
  popup.style.display = 'none';
  overlay.style.display = 'none';
  iframe.src = ''; // Очищаем iframe
  resizeObserver.disconnect();
});

overlay.addEventListener('click', () => {
  popup.style.display = 'none';
  overlay.style.display = 'none';
  iframe.src = ''; // Очищаем iframe
});
        

        function saveSize() {
            const size = {
                width: popup.style.width,
                height: popup.style.height
            };
            localStorage.setItem(storageKey, JSON.stringify(size));
        }

        function loadSize() {
            const savedSize = localStorage.getItem(storageKey);
            if (savedSize) {
                const { width, height } = JSON.parse(savedSize);
                popup.style.width = width;
                popup.style.height = height;
            }
        }

        const resizeObserver = new ResizeObserver(saveSize);
        resizeObserver.observe(popup);

        loadSize();

        return { overlay, popup, iframe };
    }

    const { overlay, popup, iframe } = createPopup();

    function getWordUnderCursor(event) {
        const range = document.caretRangeFromPoint(event.clientX, event.clientY);
        if (!range) return null;

        const text = range.startContainer.textContent;
        const offset = range.startOffset;

        if (!text) return null;

        const regex = /[^\s,"";.–:—!?()]+/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            if (match.index <= offset && regex.lastIndex >= offset) {
                return match[0];
            }
        }
        return null;
    }

    document.addEventListener('click', function (event) {
        if (event.target.closest('a, button, input, textarea, select')) return;

        const clickedWord = getWordUnderCursor(event);
        if (clickedWord) {
            console.log('Слово:', clickedWord);
            const url = `${dpdlang}${encodeURIComponent(clickedWord)}`;
            iframe.src = url;
            popup.style.display = 'block';
            overlay.style.display = 'block';
        }
    });

})();
   ```
