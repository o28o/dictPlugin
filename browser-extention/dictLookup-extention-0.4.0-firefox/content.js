// content.js
(async function() { // Make the IIFE async to use await
    'use strict';

    // 1. Cross-browser API helper
    const browserApi = typeof browser !== 'undefined' ? browser : chrome;

    // URLs and parameters for Pali Search and Lookup
    const dhammaGiftURL = 'https://dhamma.gift/?q='; // Base URL for Pali Search
    const dgParams = '&p=-kn'; // Additional parameters for Pali Search
    const storageKey = 'dictPopupSize'; // Key for storing popup size in localStorage
    const dictUrlKey = 'dictUrl'; // Key for storing custom dictionary URL
    
    // Default URLs
    const DEFAULT_DICT_URL = 'https://dict.dhamma.gift/search_html?q=';
    let customDictUrl = DEFAULT_DICT_URL; // Initialize with default value

// Сброс настроек попапа
try {
    const result = await browserApi.storage.local.get(['popup_reset_flag']);
    if (result && result.popup_reset_flag) {
        localStorage.removeItem('popupExtWidth');
        localStorage.removeItem('popupExtHeight');
        localStorage.removeItem('popupExtTop');
        localStorage.removeItem('popupExtLeft');
        localStorage.removeItem('isFirstDrag');
        localStorage.removeItem(storageKey); // 'dictPopupSize'
        
        // Удаляем флаг, чтобы не сбрасывать снова
        await browserApi.storage.local.remove('popup_reset_flag');
        console.log("Popup position and size settings have been reset.");
    }
} catch (error) {
    console.error("Error checking for popup reset flag:", error);
}

    // 2. Load saved dictionary URL using await
    // This ensures customDictUrl is loaded before any dependent code runs
    try {
        const result = await browserApi.storage.sync.get(dictUrlKey);
        if (result && result[dictUrlKey]) {
            customDictUrl = result[dictUrlKey];
            console.log("Loaded customDictUrl from storage (initial):", customDictUrl);
        } else {
            console.log("No customDictUrl found in storage (initial), using default:", customDictUrl);
        }
    } catch (error) {
        console.error("Error loading customDictUrl from storage (initial):", error);
    }

    // Listen for URL changes
    // This can remain as a listener, as it updates customDictUrl when a change occurs later
    browserApi.storage.onChanged.addListener((changes, namespace) => {
        if (changes[dictUrlKey] && namespace === 'sync') { // Ensure it's sync storage
            customDictUrl = changes[dictUrlKey].newValue;
            console.log("customDictUrl updated via storage listener:", customDictUrl);
        }
    });

    let isEnabled = true; // Flag to track if the extension is enabled

    function savePopupStateExt() {
        localStorage.setItem('popupExtWidth', popupExt.style.width);
        localStorage.setItem('popupExtHeight', popupExt.style.height);
        localStorage.setItem('popupExtTop', popupExt.style.top);
        localStorage.setItem('popupExtLeft', popupExt.style.left);
    }

    function getSelectedText() {
        const selection = window.getSelection();
        return selection ? selection.toString().trim() : '';
    }

    // Function to create a popup for displaying search results
    function createPopupExt() {
        // Create overlay for background dimming
        const overlayExt = document.createElement('div');
        overlayExt.classList.add('overlayExt');
        overlayExt.style.position = 'fixed';
        overlayExt.style.top = '0';
        overlayExt.style.left = '0';
        overlayExt.style.width = '100%';
        overlayExt.style.height = '100%';
        overlayExt.style.background = 'rgba(0, 0, 0, 0.5)';
        overlayExt.style.zIndex = '99999';
        overlayExt.style.display = 'none';

        // Create popupExt container
        const popupExt = document.createElement('div');
        popupExt.classList.add('popupExt');
        popupExt.style.position = 'fixed';
        popupExt.style.top = '50%';
        popupExt.style.left = '50%';
        popupExt.style.width = '80%';
        popupExt.style.maxWidth = '600px';
        popupExt.style.maxHeight = '600px';
        popupExt.style.height = '80%';
        popupExt.style.transform = 'translate(-50%, -50%)';
        popupExt.style.background = 'white';
        popupExt.style.border = '2px solid #666';
        popupExt.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        popupExt.style.zIndex = '100000';
        popupExt.style.display = 'none';
        popupExt.style.resize = 'both'; // Allow resizing of the popupExt
        popupExt.style.overflow = 'hidden';

        // Close button for the popupExt
        const closeBtnExt = document.createElement('button');
        closeBtnExt.classList.add('close-btnExt');
        closeBtnExt.textContent = '×';
        closeBtnExt.style.position = 'absolute';
        closeBtnExt.style.top = '10px';
        closeBtnExt.style.right = '10px';
        closeBtnExt.style.border = 'none';
        closeBtnExt.style.background = '#B71C1C';
        closeBtnExt.style.color = 'white';
        closeBtnExt.style.cursor = 'pointer';
        closeBtnExt.style.width = '30px';
        closeBtnExt.style.height = '30px';
        closeBtnExt.style.borderRadius = '50%';
        closeBtnExt.style.fontSize = '24px';
        closeBtnExt.style.display = 'flex';
        closeBtnExt.style.alignItems = 'center';
        closeBtnExt.style.justifyContent = 'center';
        closeBtnExt.title = 'Close';

        // Open button to open the search in a new tab
        const openBtnExt = document.createElement('a');
        openBtnExt.classList.add('open-btnExt');
        openBtnExt.style.position = 'absolute';
        openBtnExt.style.top = '10px';
        openBtnExt.style.right = '50px';
        openBtnExt.style.border = 'none';
        openBtnExt.style.background = '#244B26';
        openBtnExt.style.color = 'white';
        openBtnExt.style.cursor = 'pointer';
        openBtnExt.style.width = '30px';
        openBtnExt.style.height = '30px';
        openBtnExt.style.borderRadius = '50%';
        openBtnExt.style.display = 'flex';
        openBtnExt.style.alignItems = 'center';
        openBtnExt.style.justifyContent = 'center';
        openBtnExt.style.textDecoration = 'none';
        openBtnExt.target = '_blank'; // Open link in a new tab
        openBtnExt.title = 'Search with Dhamma.Gift';

        // SVG icon for the open button
        openBtnExt.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" fill="white" style="transform: scaleX(-1);">
                <path d="M505 442.7l-99.7-99.7c28.4-35.3 45.7-79.8 45.7-128C451 98.8 352.2 0 224 0S-3 98.8-3 224s98.8 224 224 224c48.2 0 92.7-17.3 128-45.7l99.7 99.7c6.2 6.2 14.4 9.4 22.6 9.4s16.4-3.1 22.6-9.4c12.5-12.5 12.5-32.8 0-45.3zM224 384c-88.4 0-160-71.6-160-160S135.6 64 224 64s160 71.6 160 160-71.6 160-160 160z"/>
            </svg>
        `;
        
        // Dictionary button to open full dictionary in new tab (dict.dhamma.gift)
        const dictBtnExt = document.createElement('a');
        dictBtnExt.classList.add('dict-btnExt');
        dictBtnExt.style.position = 'absolute';
        dictBtnExt.style.top = '10px';
        dictBtnExt.style.right = '90px'; // Positioned to the left of openBtnExt
        dictBtnExt.style.border = 'none';
        dictBtnExt.style.background = '#2D3E50'; // Different color for distinction
        dictBtnExt.style.color = 'white';
        dictBtnExt.style.cursor = 'pointer';
        dictBtnExt.style.width = '30px';
        dictBtnExt.style.height = '30px';
        dictBtnExt.style.borderRadius = '50%';
        dictBtnExt.style.display = 'flex';
        dictBtnExt.style.alignItems = 'center';
        dictBtnExt.style.justifyContent = 'center';
        dictBtnExt.style.textDecoration = 'none';
        dictBtnExt.target = '_blank'; // Open link in a new tab
        dictBtnExt.title = 'Open in DPD full mode';
        
            
    // Создаем элемент img для иконки из файла
const dictIconExt = document.createElement('img');
// Получаем полный и безопасный URL к файлу внутри расширения
dictIconExt.src = browserApi.runtime.getURL('dpd-logo-dark.svg');
// Задаем размеры, как у инлайн-версии
dictIconExt.style.width = '16px';
dictIconExt.style.height = '16px';

// Добавляем иконку в кнопку
dictBtnExt.appendChild(dictIconExt);
          
        // iframeExt to display search results
        const iframeExt = document.createElement('iframe');
        iframeExt.style.height = '100%';
        iframeExt.style.width = '100%';
        iframeExt.style.border = 'none';
        iframeExt.style.overflow = 'hidden';

        // Drag handle for moving the popupExt
        const resizeHandleExt = document.createElement('div');
        resizeHandleExt.classList.add('resize-handleExt');
        resizeHandleExt.style.position = 'absolute';
        resizeHandleExt.style.right = '0';
        resizeHandleExt.style.bottom = '0';
        resizeHandleExt.style.width = '20px';
        resizeHandleExt.style.height = '20px';
        resizeHandleExt.style.cursor = 'nwse-resize';
        resizeHandleExt.style.zIndex = '10';
        
        // Create triangle for resize handle
        resizeHandleExt.innerHTML = `
            <style>
                .resize-handle::after {
                    content: "";
                    position: absolute;
                    right: 3px;
                    bottom: 3px;
                    width: 0;
                    height: 0;
                    border-style: solid;
                    border-width: 0 0 12px 12px;
                    border-color: transparent transparent #666 transparent;
                }
            </style>
        `;

        const headerExt = document.createElement('div');
        headerExt.classList.add('popup-headerExt');
        headerExt.style.cursor = 'move';
        headerExt.style.height = '10px';
        headerExt.style.display = 'flex';
        headerExt.style.alignItems = 'center';
        headerExt.style.padding = '0 10px';
        headerExt.textContent = '';

        // Append elements to the popup and document body
        popupExt.appendChild(headerExt);
        popupExt.appendChild(dictBtnExt);
        popupExt.appendChild(openBtnExt);
        popupExt.appendChild(closeBtnExt);
        popupExt.appendChild(iframeExt);
        popupExt.appendChild(resizeHandleExt);

        document.body.appendChild(overlayExt);
        document.body.appendChild(popupExt);

        // Drag functionality
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;
        let isFirstDrag = localStorage.getItem('isFirstDrag') === 'false' ? false : true;

        if (isFirstDrag) {
            popupExt.style.top = '50%';
            popupExt.style.left = '50%';
            popupExt.style.width = '80%';
            popupExt.style.maxWidth = '600px';
            popupExt.style.height = '80%';
            popupExt.style.transform = 'translate(-50%, -50%)';
        }

        function startDragExt(e) {
            isDragging = true;
            
            if (isFirstDrag) {
                const rect = popupExt.getBoundingClientRect();
                popupExt.style.transform = 'none';
                popupExt.style.top = rect.top + 'px';
                popupExt.style.left = rect.left + 'px';
                isFirstDrag = false;
                localStorage.setItem('isFirstDrag', isFirstDrag);
            }  
            
            startX = e.clientX || e.touches[0].clientX;
            startY = e.clientY || e.touches[0].clientY;
            initialLeft = parseInt(popupExt.style.left || 0, 10);
            initialTop = parseInt(popupExt.style.top || 0, 10);
            e.preventDefault();
        }

        function moveDragExt(e) {
            if (isDragging) {
                const deltaX = (e.clientX || e.touches[0].clientX) - startX;
                const deltaY = (e.clientY || e.touches[0].clientY) - startY;
                popupExt.style.left = `${initialLeft + deltaX}px`;
                popupExt.style.top = `${initialTop + deltaY}px`;
            }
        }

        function stopDragExt() {
            if (isDragging) {
                isDragging = false;
                savePopupStateExt();
            }
        }

        // Event listeners for dragging
        headerExt.addEventListener('mousedown', startDragExt);
        document.addEventListener('mousemove', moveDragExt);
        document.addEventListener('mouseup', stopDragExt);
        headerExt.addEventListener('touchstart', startDragExt);
        document.addEventListener('touchmove', moveDragExt);
        document.addEventListener('touchend', stopDragExt);

        // Function to close the popupExt
        function closePopupExt(event) {
            event.stopPropagation();
            popupExt.style.display = 'none';
            overlayExt.style.display = 'none';
            iframeExt.src = '';
        }

        closeBtnExt.addEventListener('click', closePopupExt);
        overlayExt.addEventListener('click', closePopupExt);

        // Save popupExt size to localStorage
        function saveSizeExt() {
            const size = {
                width: popupExt.style.width,
                height: popupExt.style.height
            };
            localStorage.setItem(storageKey, JSON.stringify(size));
        }

        // Load saved popupExt size from localStorage
        function loadSizeExt() {
            const savedSize = localStorage.getItem(storageKey);
            if (savedSize) {
                const { width, height } = JSON.parse(savedSize);
                popupExt.style.width = width;
                popupExt.style.height = height;
            }
        }

        // Resize functionality
        let isResizing = false;
        let startWidth, startHeight, startResizeExtX, startResizeExtY;

        resizeHandleExt.addEventListener('mousedown', startResizeExt);
        resizeHandleExt.addEventListener('touchstart', startResizeExt);

        function startResizeExt(e) {
            isResizing = true;
            startWidth = parseInt(document.defaultView.getComputedStyle(popupExt).width, 10);
            startHeight = parseInt(document.defaultView.getComputedStyle(popupExt).height, 10);
            startResizeExtX = e.clientX || e.touches[0].clientX;
            startResizeExtY = e.clientY || e.touches[0].clientY;
            
            e.preventDefault();
            e.stopPropagation();
        }

        function doResizeExt(e) {
            if (!isResizing) return;
            
            const currentX = e.clientX || e.touches[0].clientX;
            const currentY = e.clientY || e.touches[0].clientY;
            
            const newWidth = startWidth + (currentX - startResizeExtX);
            const newHeight = startHeight + (currentY - startResizeExtY);
            
            const minWidth = 200;
            const minHeight = 150;
            const maxWidth = window.innerWidth * 0.9;
            const maxHeight = window.innerHeight * 0.9;
            
            popupExt.style.width = Math.max(minWidth, Math.min(newWidth, maxWidth)) + 'px';
            popupExt.style.height = Math.max(minHeight, Math.min(newHeight, maxHeight)) + 'px';
            
            e.preventDefault();
            e.stopPropagation();
        }

        function stopResizeExt() {
            isResizing = false;
            savePopupStateExt();
        }

        document.addEventListener('mousemove', doResizeExt);
        document.addEventListener('touchmove', doResizeExt);
        document.addEventListener('mouseup', stopResizeExt);
        document.addEventListener('touchend', stopResizeExt);
        
        loadSizeExt();

        // 6. Return values from createPopupExt for use in the main IIFE scope
        return { overlayExt, popupExt, iframeExt, openBtnExt, dictBtnExt };
    }

    // 7. Call createPopupExt after customDictUrl is potentially loaded
    const { overlayExt, popupExt, iframeExt, openBtnExt, dictBtnExt } = createPopupExt();

    // Function to process and clean up the word
    function processWordExt(word) {
        return word
            .replace(/^[\s'‘—.–…"“”]+/, '') // Remove leading punctuation
            .replace(/[\s'‘,—.—–"“…:;”]+$/, '') // Remove trailing punctuation
            .replace(/[‘'’‘"“””]+/g, "'") // Normalize quotes
            .trim()
            .toLowerCase();
    }

    // Function to get the word under the cursor
    function getWordUnderCursorExt(event) {
        const range = document.caretRangeFromPoint(event.clientX, event.clientY);
        if (!range) return null;
        const text = range.startContainer.textContent;
        const offset = range.startOffset;
        if (!text) return null;
        const regex = /[^\s,"";.–:—!?()]+/g; // Regex to match words
        let match;
        while ((match = regex.exec(text)) !== null) {
            if (match.index <= offset && regex.lastIndex >= offset) {
                return match[0];
            }
        }
        return null;
    }

    // Function to show translation for a given word
    async function showTranslation(word) { // Make this function async
        const processedWord = processWordExt(word);
        const url = `${customDictUrl}${encodeURIComponent(processedWord)}`;
        iframeExt.src = url;
        popupExt.style.display = 'block';
        overlayExt.style.display = 'block';
        openBtnExt.href = `${dhammaGiftURL}${encodeURIComponent(processedWord)}${dgParams}`;
        
        // 8. Update dictBtnExt href based on custom URL (now awaits for consistency)
        try {
            const result = await browserApi.storage.sync.get(dictUrlKey);
            const dictUrl = result[dictUrlKey] || DEFAULT_DICT_URL; // Use the loaded value or default
            dictBtnExt.href = `${dictUrl}${encodeURIComponent(processedWord)}`;
        } catch (error) {
            console.error("Error updating dictBtnExt href:", error);
            dictBtnExt.href = `${DEFAULT_DICT_URL}${encodeURIComponent(processedWord)}`; // Fallback to default
        }
    }

    // Function to handle click events and display search results
    function handleClickExt(event) {
        if (!isEnabled) return;
        if (event.target.closest('a, button, input, textarea, select')) return;
        
        // First check for selected text
        const selectedText = getSelectedText();
        if (selectedText) {
            showTranslation(selectedText);
            return;
        }
        
        // If no text selected, check for word under cursor
        const clickedWord = getWordUnderCursorExt(event);
        if (clickedWord) {
            showTranslation(clickedWord);
        }
    }

    // Initialize extension state (using browserApi)
    // This can remain as a callback because it's handling initial state,
    // but can also be awaited if subsequent code depends on `isEnabled`
    browserApi.storage.local.get(['isEnabled'], (result) => {
        isEnabled = result.isEnabled !== undefined ? result.isEnabled : true;
        if (isEnabled) {
            document.addEventListener('click', handleClickExt);
            console.log("Extension enabled, click listener added.");
        } else {
            console.log("Extension disabled on load.");
        }
    });

    // Listener for storage changes (using browserApi)
    browserApi.storage.onChanged.addListener((changes, namespace) => {
        if (changes.isEnabled && namespace === 'local') { // Ensure it's local storage
            isEnabled = changes.isEnabled.newValue;
            if (isEnabled) {
                document.addEventListener('click', handleClickExt);
                console.log("Extension enabled via storage change.");
            } else {
                document.removeEventListener('click', handleClickExt);
                popupExt.style.display = 'none';
                overlayExt.style.display = 'none';
                console.log("Extension disabled via storage change.");
            }
        }
    });

})(); // End of async IIFE