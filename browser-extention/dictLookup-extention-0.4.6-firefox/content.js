// content.js
(function() {
    'use strict';
    const scrollbarStyles = `
        ::-webkit-scrollbar {
            width: 12px;
            background: #E1EBED;
        }
        ::-webkit-scrollbar-thumb {
            background: #B0C4DE;
            border-radius: 6px;
            border: 2px solid #E1EBED;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #a0b4ce;
        }
        [data-theme="dark"] ::-webkit-scrollbar, html.dark ::-webkit-scrollbar {
            background: #07021D;
        }
        [data-theme="dark"] ::-webkit-scrollbar-thumb, html.dark ::-webkit-scrollbar-thumb {
            background: #2D3E50;
            border-color: #07021D;
        }

         .popupExt.dragging {
        opacity: 0.9;
        cursor: move;
    }
    
    .popupExt.resizing {
        opacity: 0.9;
    }
    
    .popupExt.dragging iframe,
    .popupExt.resizing iframe {
        pointer-events: none;
    }
        
    `;
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = scrollbarStyles;
    document.head.appendChild(styleSheet);
})();

if (window.self === window.top) {
(async function() { // Make the IIFE async to use await
    'use strict';

    // 1. Cross-browser API helper
    const browserApi = typeof browser !== 'undefined' ? browser : chrome;

    // URLs, parameters, and storage keys
    const dhammaGiftURL = 'https://dhamma.gift/?q=';
    const dgParams = '&p=-kn';
    const storageKey = 'dictPopupSize';
    const dictUrlKey = 'dictUrl';
    
    // Default URLs and modes
    const DEFAULT_POPUP_URL = 'https://dict.dhamma.gift/search_html?q=';
    const NEW_WINDOW_URL_EN = 'https://dict.dhamma.gift/search_html?q=';
    const NEW_WINDOW_URL_RU = 'https://dict.dhamma.gift/ru/search_html?q=';
    let currentModeOrUrl = DEFAULT_POPUP_URL;

    // Reset popup settings logic
    try {
        const result = await browserApi.storage.local.get(['popup_reset_flag']);
        if (result && result.popup_reset_flag) {
            localStorage.removeItem('popupExtWidth');
            localStorage.removeItem('popupExtHeight');
            localStorage.removeItem('popupExtTop');
            localStorage.removeItem('popupExtLeft');
            localStorage.removeItem(storageKey);
            await browserApi.storage.local.remove('popup_reset_flag');
            console.log("Popup position and size settings have been reset.");
        }
    } catch (error) {
        console.error("Error checking for popup reset flag:", error);
    }

    // Load saved mode or URL from storage
    try {
        const result = await browserApi.storage.sync.get(dictUrlKey);
        if (result && result[dictUrlKey]) {
            currentModeOrUrl = result[dictUrlKey];
        }
    } catch (error) {
        console.error("Error loading mode/URL from storage:", error);
    }

    // Listen for changes
    browserApi.storage.onChanged.addListener((changes, namespace) => {
        if (changes[dictUrlKey] && namespace === 'sync') {
            currentModeOrUrl = changes[dictUrlKey].newValue;
        }
    });

    let isEnabled = true;

    // --- NEW WINDOW MODE LOGIC ---
    let dictionaryWindow = null;
    function openDictionaryWindowExt(url) {
        
        const newWindowWidth = 500, newWindowHeight = 500;
        const screenWidth = window.screen.availWidth, screenHeight = window.screen.availHeight;
        const newWindowLeft = screenWidth - newWindowWidth - 30;
        const newWindowTop = screenHeight - newWindowHeight - 50;
        const popupFeatures = `width=${newWindowWidth},height=${newWindowHeight},left=${newWindowLeft},top=${newWindowTop},scrollbars=yes,resizable=yes`;
        dictionaryWindow = window.open(url, 'dictionaryPopup', popupFeatures);
        if (dictionaryWindow) dictionaryWindow.focus();
    }

    // --- POPUP MODE LOGIC ---
    function createPopupExt() {
        // Create elements
        const overlayExt = document.createElement('div');
        overlayExt.className = 'overlayExt';
        const popupExt = document.createElement('div');
        popupExt.className = 'popupExt';
        const closeBtnExt = document.createElement('button');
        const openBtnExt = document.createElement('a');
        const dictBtnExt = document.createElement('a');
        const iframeExt = document.createElement('iframe');
        const resizeHandleExt = document.createElement('div');
        const headerExt = document.createElement('div');
        
        // Styles and attributes
        Object.assign(overlayExt.style, { position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.5)', zIndex: '99999', display: 'none' });
        Object.assign(popupExt.style, { position: 'fixed', width: '80%', maxWidth: '600px', maxHeight: '600px', height: '80%', background: 'white', border: '2px solid #666', boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)', zIndex: '100000', display: 'none', overflow: 'hidden' });
        Object.assign(closeBtnExt.style, { position: 'absolute', top: '10px', right: '10px', border: 'none', background: '#B71C1C', color: 'white', cursor: 'pointer', width: '30px', height: '30px', borderRadius: '50%', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' });
        closeBtnExt.textContent = '×';
        closeBtnExt.title = 'Close';
        
        Object.assign(openBtnExt.style, { position: 'absolute', top: '10px', right: '50px', border: 'none', background: '#244B26', color: 'white', cursor: 'pointer', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' });
        openBtnExt.target = '_blank';
        openBtnExt.title = 'Search with Dhamma.Gift';
        openBtnExt.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" fill="white" style="transform: scaleX(-1);"><path d="M505 442.7l-99.7-99.7c28.4-35.3 45.7-79.8 45.7-128C451 98.8 352.2 0 224 0S-3 98.8-3 224s98.8 224 224 224c48.2 0 92.7-17.3 128-45.7l99.7 99.7c6.2 6.2 14.4 9.4 22.6 9.4s16.4-3.1 22.6-9.4c12.5-12.5 12.5-32.8 0-45.3zM224 384c-88.4 0-160-71.6-160-160S135.6 64 224 64s160 71.6 160 160-71.6 160-160 160z"/></svg>`;

        Object.assign(dictBtnExt.style, { position: 'absolute', top: '10px', right: '90px', border: 'none', background: '#2D3E50', color: 'white', cursor: 'pointer', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' });
        dictBtnExt.target = '_blank';
        dictBtnExt.title = 'Open in DPD full mode';
        const dictIconExt = document.createElement('img');
        dictIconExt.src = browserApi.runtime.getURL('dpd-logo-dark.svg');
        Object.assign(dictIconExt.style, { width: '16px', height: '16px' });
        dictBtnExt.appendChild(dictIconExt);

        Object.assign(iframeExt.style, { height: '100%', width: '100%', border: 'none', overflow: 'hidden' });
        Object.assign(resizeHandleExt.style, { position: 'absolute', right: '0', bottom: '0', width: '20px', height: '20px', cursor: 'nwse-resize', zIndex: '10' });
        resizeHandleExt.innerHTML = `<style>.resize-handle::after { content: ""; position: absolute; right: 3px; bottom: 3px; width: 0; height: 0; border-style: solid; border-width: 0 0 12px 12px; border-color: transparent transparent #666 transparent; }</style>`;
        Object.assign(headerExt.style, { cursor: 'move', height: '10px', display: 'flex', alignItems: 'center', padding: '0 10px' });

        popupExt.append(headerExt, dictBtnExt, openBtnExt, closeBtnExt, iframeExt, resizeHandleExt);
        document.body.append(overlayExt, popupExt);

        // Positioning and Sizing
        function savePopupStateExt() {
            const rect = popupExt.getBoundingClientRect();
            localStorage.setItem('popupExtTop', `${rect.top}px`);
            localStorage.setItem('popupExtLeft', `${rect.left}px`);
            localStorage.setItem('popupExtWidth', popupExt.style.width);
            localStorage.setItem('popupExtHeight', popupExt.style.height);
        }

        popupExt.style.top = localStorage.getItem('popupExtTop') || `${window.innerHeight / 2 - 300}px`;
        popupExt.style.left = localStorage.getItem('popupExtLeft') || `${window.innerWidth / 2 - 375}px`;
        popupExt.style.width = localStorage.getItem('popupExtWidth') || '749px';
        popupExt.style.height = localStorage.getItem('popupExtHeight') || '600px';

        // Event handling for dragging
        let isDraggingExt = false, startX, startY, initialLeft, initialTop;
        headerExt.addEventListener('mousedown', e => {
            isDraggingExt = true;
            iframeExt.style.pointerEvents = 'none';
            popupExt.classList.add('dragging');
            startX = e.clientX; startY = e.clientY;
            initialLeft = parseInt(popupExt.style.left, 10);
            initialTop = parseInt(popupExt.style.top, 10);
        });

        // Event handling for resizing
        let isResizingExt = false, startWidth, startHeight, startResizeExtX, startResizeExtY;
        resizeHandleExt.addEventListener('mousedown', e => {
            isResizingExt = true;
            iframeExt.style.pointerEvents = 'none';
            popupExt.classList.add('resizing');
            startWidth = parseInt(document.defaultView.getComputedStyle(popupExt).width, 10);
            startHeight = parseInt(document.defaultView.getComputedStyle(popupExt).height, 10);
            startResizeExtX = e.clientX;
            startResizeExtY = e.clientY;
            e.preventDefault();
        });

        document.addEventListener('mousemove', e => {
            if (isDraggingExt) {
                popupExt.style.left = `${initialLeft + e.clientX - startX}px`;
                popupExt.style.top = `${initialTop + e.clientY - startY}px`;
            }
            if (isResizingExt) {
                const newWidth = startWidth + (e.clientX - startResizeExtX);
                const newHeight = startHeight + (e.clientY - startResizeExtY);
                popupExt.style.width = Math.max(200, newWidth) + 'px';
                popupExt.style.height = Math.max(150, newHeight) + 'px';
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDraggingExt) {
                isDraggingExt = false;
                iframeExt.style.pointerEvents = 'auto';
                popupExt.classList.remove('dragging');
                savePopupStateExt();
            }
            if (isResizingExt) {
                isResizingExt = false;
                iframeExt.style.pointerEvents = 'auto';
                popupExt.classList.remove('resizing');
                savePopupStateExt();
            }
        });

        // Close functionality
        const closePopupExt = (event) => {
            event.stopPropagation();
            savePopupStateExt();
            popupExt.style.display = 'none';
            overlayExt.style.display = 'none';
            iframeExt.src = '';
        };
        closeBtnExt.addEventListener('click', closePopupExt);
        overlayExt.addEventListener('click', closePopupExt);

        return { overlayExt, popupExt, iframeExt, openBtnExt, dictBtnExt };
    }
    const { overlayExt, popupExt, iframeExt, openBtnExt, dictBtnExt } = createPopupExt();

    // --- CORE LOGIC ---
    const getSelectedText = () => window.getSelection().toString().trim();
    const processWordExt = (word) => word.replace(/^[\s'‘—.–…"“”]+/, '').replace(/[\s'‘,—.—–"“…:;”]+$/, '').replace(/[‘'’‘"“””]+/g, "'").trim().toLowerCase();
    
    // Full getWordUnderCursorExt function restored
 function getWordUnderCursorExt(event) {
    const x = event.clientX;
    const y = event.clientY;
    let range;

    // Используем стандартные методы для определения позиции курсора
    if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(x, y);
    } else if (document.caretPositionFromPoint) { // Для Firefox
        const pos = document.caretPositionFromPoint(x, y);
        if (!pos || !pos.offsetNode) {
            return null;
        }
        range = document.createRange();
        range.setStart(pos.offsetNode, pos.offset);
    } else {
        return null; // Нет доступных методов
    }

    if (!range || !range.startContainer) {
        return null;
    }

    // Цель клика должна быть текстовым узлом
    if (range.startContainer.nodeType !== Node.TEXT_NODE) {
        return null;
    }

    // --- КЛЮЧЕВАЯ ГЕОМЕТРИЧЕСКАЯ ПРОВЕРКА ---
    // Создаем диапазон для всего текстового узла, чтобы получить его границы
    const nodeRange = document.createRange();
    nodeRange.selectNode(range.startContainer);
    const nodeRect = nodeRange.getBoundingClientRect();

    // Если клик был за пределами прямоугольника текста, выходим
    if (x < nodeRect.left || x > nodeRect.right || y < nodeRect.top || y > nodeRect.bottom) {
        return null;
    }

    // Если проверка пройдена, находим слово
    const text = range.startContainer.textContent;
    const offset = range.startOffset;

    // Ищем начало слова, двигаясь назад от курсора
    let start = offset;
    while (start > 0 && text[start - 1] && !/\s|[.,;"'!?()“–—]/.test(text[start - 1])) {
        start--;
    }

    // Ищем конец слова, двигаясь вперед
    let end = offset;
    while (end < text.length && text[end] && !/\s|[.,;"'!?()“–—]/.test(text[end])) {
        end++;
    }

    const word = text.substring(start, end);

    if (word && word.trim().length > 0) {
        return word;
    }

    return null;
}

    // Helper function to trigger custom protocols without opening a blank tab in Firefox
    function triggerCustomProtocol(url) {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        iframe.contentWindow.location.href = url;
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 500);
    }

    async function showTranslation(word) {
        const processedWord = processWordExt(word);
        const encodedWord = encodeURIComponent(processedWord);
        let url;

        switch (currentModeOrUrl) {
            case 'newWindowExt':
                url = `${NEW_WINDOW_URL_EN}${encodedWord}`;
                openDictionaryWindowExt(url);
                break;
            case 'newWindowRuExt':
                url = `${NEW_WINDOW_URL_RU}${encodedWord}`;
                openDictionaryWindowExt(url);
                break;
            case 'goldendict://':
                url = `${currentModeOrUrl}${encodedWord}`;
                triggerCustomProtocol(url);
                break;
            case 'dttp://app.dicttango/WordLookup?word=':
                url = `${currentModeOrUrl}${encodedWord}`;
                triggerCustomProtocol(url);
                break;
            default: // Handles all popup modes
                url = `${currentModeOrUrl}${encodedWord}`;
                iframeExt.src = url;
                popupExt.style.display = 'block';
                overlayExt.style.display = 'block';
                openBtnExt.href = `${dhammaGiftURL}${encodedWord}${dgParams}`;
                dictBtnExt.href = `${currentModeOrUrl.startsWith('http') ? currentModeOrUrl : DEFAULT_POPUP_URL}${encodedWord}`;
                break;
        }
    }

    const handleClickExt = (event) => {
        if (!isEnabled || event.target.closest('a, button, input, textarea, select, .popupExt')) return;
        const selectedText = getSelectedText();
        if (selectedText) { showTranslation(selectedText); return; }
        const clickedWord = getWordUnderCursorExt(event);
        if (clickedWord) { showTranslation(clickedWord); }
    };

    // Initialize and add/remove event listeners
    browserApi.storage.local.get(['isEnabled'], (result) => {
        isEnabled = result.isEnabled !== false;
        if (isEnabled) document.addEventListener('click', handleClickExt);
    });

    browserApi.storage.onChanged.addListener((changes, namespace) => {
        if (changes.isEnabled && namespace === 'local') {
            isEnabled = changes.isEnabled.newValue;
            if (isEnabled) {
                document.addEventListener('click', handleClickExt);
            } else {
                document.removeEventListener('click', handleClickExt);
                popupExt.style.display = 'none';
                overlayExt.style.display = 'none';
            }
        }
    });

})();
}