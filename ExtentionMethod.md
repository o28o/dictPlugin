Adding Pali Lookup to any site, works for any browser that supports custom js extentions. e.g. Chrome, Edge, Brave, Safari.

Limitation: CORS related policies of some sites might block the iframe with the translation. 

1. Install one of the custom js extentions of your choice: e.g. Tampermonkey, ScriptCat, Violentmonkey.
2. Enable developer mode in browser settings. 
3. Create a custom script with the code listed below. This code is suitable for Tampermonkey and ScriptCat without any changes. For other extentions header part might slightly vary. 
4. Enable the plugin, enable the custom script.
5. Open or refresh page and click the desired word. Enjoy.

This is a pretty basic code. If you'll improve it or get better solution for this case, please let me know.

   ## Code to paste in step 2
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
        overlay.style.zIndex = '99999'; // Оверлей выше всех элементов, кроме окна
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
        popup.style.zIndex = '100000'; // Окно выше оверлея
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

        // Создаем верхнюю панель для перетаскивания
        const dragHandle = document.createElement('div');
        dragHandle.style.position = 'absolute';
        dragHandle.style.top = '0';
        dragHandle.style.left = '0';
        dragHandle.style.width = '100%';
        dragHandle.style.height = '5px';
        dragHandle.style.background = '#f0f0f0';
        dragHandle.style.cursor = 'move';

        popup.appendChild(dragHandle);
        popup.appendChild(closeBtn);
        popup.appendChild(iframe);
        document.body.appendChild(overlay);
        document.body.appendChild(popup);

        let isDragging = false;
        let offsetX, offsetY;

        dragHandle.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - popup.getBoundingClientRect().left;
            offsetY = e.clientY - popup.getBoundingClientRect().top;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                popup.style.left = `${e.clientX - offsetX}px`;
                popup.style.top = `${e.clientY - offsetY}px`;
                popup.style.transform = 'none';
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        function closePopup() {
            popup.style.display = 'none';
            overlay.style.display = 'none';
            iframe.src = '';
        }

        closeBtn.addEventListener('click', closePopup);

overlay.addEventListener('click', () => {
  popup.style.display = 'none';
  overlay.style.display = 'none';
  iframe.src = ''; // Очищаем iframe
  closePopup();
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

        function resetSize() {
            // Сбрасываем размеры и позицию окна
            popup.style.width = '80%';
            popup.style.height = '80%';
            popup.style.top = '50%';
            popup.style.left = '50%';
            popup.style.transform = 'translate(-50%, -50%)';
            localStorage.removeItem(storageKey); // Удаляем сохраненные размеры
        }

        const resizeObserver = new ResizeObserver(saveSize);
        resizeObserver.observe(popup);

        // Сбрасываем размеры при изменении размеров окна браузера
        window.addEventListener('resize', resetSize);

        loadSize();

        return { overlay, popup, iframe };
    }

    const { overlay, popup, iframe } = createPopup();

    function processWord(word) {
        return word
            .replace(/^[\s'‘—.–…"“”]+/, '') // Убираем символы в начале, включая пробелы и тире
            .replace(/[\s'‘,—.—–"“…:;”]+$/, '') // Убираем символы в конце, включая пробелы и тире
            .replace(/[‘'’‘"“””]+/g, "'") // Заменяем кавычки в середине
            .trim() // Убираем лишние пробелы
            .toLowerCase(); // Приводим к нижнему регистру
    }

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
            const processedWord = processWord(clickedWord); // Обрабатываем слово
            console.log('Слово:', processedWord);
            const url = `${dpdlang}${encodeURIComponent(processedWord)}`;
            iframe.src = url;
            popup.style.display = 'block';
            overlay.style.display = 'block';
        }
    });

})();
   ```
