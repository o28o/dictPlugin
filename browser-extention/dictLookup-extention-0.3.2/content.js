(function() {
    'use strict';

    // URLs and parameters for Pali Search and Lookup
    const dhammaGiftURL = 'https://dhamma.gift/?q='; // Base URL for Pali Search
    const dgParams = '&p=-kn'; // Additional parameters for Pali Search
    const dpdlang = 'https://dpdict.net/gd?search='; // URL for Pali Lookup
    const storageKey = 'dictPopupSize'; // Key for storing popup size in localStorage

    let isEnabled = true; // Flag to track if the extension is enabled

    // Function to create a popup for displaying search results
    function createPopup() {
        // Create overlay for background dimming
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

        // Create popup container
        const popup = document.createElement('div');
        popup.classList.add('popup');
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.width = '80%';
        popup.style.maxWidth = '600px';
  popup.style.maxHeight = '600px';
        popup.style.height = '80%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.background = 'white';
        popup.style.border = '2px solid #666';
        popup.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        popup.style.zIndex = '100000';
        popup.style.display = 'none';
        popup.style.resize = 'both'; // Allow resizing of the popup
        popup.style.overflow = 'hidden';

        // Close button for the popup
        const closeBtn = document.createElement('button');
        closeBtn.classList.add('close-btn');
        closeBtn.textContent = '×';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '10px';
        closeBtn.style.border = 'none';
        closeBtn.style.background = '#B71C1C';
        closeBtn.style.color = 'white';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.width = '30px';
        closeBtn.style.height = '30px';
        closeBtn.style.borderRadius = '50%';
        closeBtn.style.fontSize = '24px';
        closeBtn.style.display = 'flex';
        closeBtn.style.alignItems = 'center';
        closeBtn.style.justifyContent = 'center';

        // Open button to open the search in a new tab
        const openBtn = document.createElement('a');
        openBtn.classList.add('open-btn');
        openBtn.style.position = 'absolute';
        openBtn.style.top = '10px';
        openBtn.style.right = '50px';
        openBtn.style.border = 'none';
        openBtn.style.background = '#244B26';
        openBtn.style.color = 'white';
        openBtn.style.cursor = 'pointer';
        openBtn.style.width = '30px';
        openBtn.style.height = '30px';
        openBtn.style.borderRadius = '50%';
        openBtn.style.display = 'flex';
        openBtn.style.alignItems = 'center';
        openBtn.style.justifyContent = 'center';
        openBtn.style.textDecoration = 'none';
        openBtn.target = '_blank'; // Open link in a new tab

        // SVG icon for the open button
        openBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16" fill="white" style="transform: scaleX(-1);">
                <path d="M505 442.7l-99.7-99.7c28.4-35.3 45.7-79.8 45.7-128C451 98.8 352.2 0 224 0S-3 98.8-3 224s98.8 224 224 224c48.2 0 92.7-17.3 128-45.7l99.7 99.7c6.2 6.2 14.4 9.4 22.6 9.4s16.4-3.1 22.6-9.4c12.5-12.5 12.5-32.8 0-45.3zM224 384c-88.4 0-160-71.6-160-160S135.6 64 224 64s160 71.6 160 160-71.6 160-160 160z"/>
            </svg>
        `;

        // Iframe to display search results
        const iframe = document.createElement('iframe');
        iframe.sandbox = 'allow-scripts'; // Restrict iframe capabilities for security
        iframe.style.height = '100%';
        iframe.style.width = '100%';
        iframe.style.border = 'none';
        iframe.style.overflow = 'hidden';

        // Drag handle for moving the popup
    // Создаем треугольник для ресайза
    const resizeHandle = document.createElement('div');
    resizeHandle.classList.add('resize-handle');
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.right = '0';
    resizeHandle.style.bottom = '0';
    resizeHandle.style.width = '20px';
    resizeHandle.style.height = '20px';
    resizeHandle.style.cursor = 'nwse-resize';
    resizeHandle.style.zIndex = '10';
    
    // Создаем треугольник с помощью CSS
    resizeHandle.innerHTML = `
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

    const header = document.createElement('div');
    header.classList.add('popup-header');
    header.style.cursor = 'move';
    header.style.height = '10px';
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.padding = '0 10px';
    header.textContent = '';

        // Append elements to the popup and document body
        popup.appendChild(header);
        popup.appendChild(closeBtn);
        popup.appendChild(openBtn);
        popup.appendChild(iframe);
        popup.appendChild(resizeHandle);

        document.body.appendChild(overlay);
        document.body.appendChild(popup);

    // Перетаскивание окна
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;
    let isFirstDrag = localStorage.getItem('isFirstDrag') === 'false' ? false : true;

    if (isFirstDrag) {
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.width = '80%';
        popup.style.maxWidth = '600px';
        popup.style.height = '80%';
        popup.style.transform = 'translate(-50%, -50%)';
    }

    // Обработчик нажатия для мыши (десктоп)
    function startDrag(e) {
        isDragging = true;
        
        // Добавить этот блок для первого перемещения
        if (isFirstDrag) {
            const rect = popup.getBoundingClientRect();
            popup.style.transform = 'none';  // убираем transform, который центрирует окно
            popup.style.top = rect.top + 'px';
            popup.style.left = rect.left + 'px';
            isFirstDrag = false;
            // Сохраняем состояние isFirstDrag в sessionStorage
            localStorage.setItem('isFirstDrag', isFirstDrag);
        }  
        
        startX = e.clientX || e.touches[0].clientX;
        startY = e.clientY || e.touches[0].clientY;
        initialLeft = parseInt(popup.style.left || 0, 10);
        initialTop = parseInt(popup.style.top || 0, 10);
        e.preventDefault();
    }

    function moveDrag(e) {
        if (isDragging) {
            const deltaX = (e.clientX || e.touches[0].clientX) - startX;
            const deltaY = (e.clientY || e.touches[0].clientY) - startY;
            popup.style.left = `${initialLeft + deltaX}px`;
            popup.style.top = `${initialTop + deltaY}px`;
        }
    }

    function stopDrag() {
        if (isDragging) {
            isDragging = false;
            savePopupState();
        }
    }

    // Обработчики для перетаскивания
    header.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('mouseup', stopDrag);
    header.addEventListener('touchstart', startDrag);
    document.addEventListener('touchmove', moveDrag);
    document.addEventListener('touchend', stopDrag);

        // Function to close the popup
        function closePopup(event) {
            event.stopPropagation(); // Prevent event bubbling
            popup.style.display = 'none';
            overlay.style.display = 'none';
            iframe.src = ''; // Clear iframe content
        }

        closeBtn.addEventListener('click', closePopup);
        overlay.addEventListener('click', closePopup);

        // Save popup size to localStorage
        function saveSize() {
            const size = {
                width: popup.style.width,
                height: popup.style.height
            };
            localStorage.setItem(storageKey, JSON.stringify(size));
        }

        // Load saved popup size from localStorage
        function loadSize() {
            const savedSize = localStorage.getItem(storageKey);
            if (savedSize) {
                const { width, height } = JSON.parse(savedSize);
                popup.style.width = width;
                popup.style.height = height;
            }
        }

    function savePopupState() {
        localStorage.setItem('popupWidth', popup.style.width);
        localStorage.setItem('popupHeight', popup.style.height);
        localStorage.setItem('popupTop', popup.style.top);
        localStorage.setItem('popupLeft', popup.style.left);
        console.log('savedstates');
    }

        // Reset popup size to default
        function resetSize() {
            popup.style.width = '80%';
            popup.style.height = '80%';
            popup.style.top = '50%';
            popup.style.left = '50%';
            popup.style.transform = 'translate(-50%, -50%)';
            localStorage.removeItem(storageKey);
        }

    // Реализация ресайза с помощью треугольника
    let isResizing = false;
    let startWidth, startHeight, startResizeX, startResizeY;

    resizeHandle.addEventListener('mousedown', startResize);
    resizeHandle.addEventListener('touchstart', startResize);

    function startResize(e) {
        isResizing = true;
        startWidth = parseInt(document.defaultView.getComputedStyle(popup).width, 10);
        startHeight = parseInt(document.defaultView.getComputedStyle(popup).height, 10);
        startResizeX = e.clientX || e.touches[0].clientX;
        startResizeY = e.clientY || e.touches[0].clientY;
        
        e.preventDefault();
        e.stopPropagation();
    }

    function doResize(e) {
        if (!isResizing) return;
        
        const currentX = e.clientX || e.touches[0].clientX;
        const currentY = e.clientY || e.touches[0].clientY;
        
        const newWidth = startWidth + (currentX - startResizeX);
        const newHeight = startHeight + (currentY - startResizeY);
        
        // Ограничения по минимальному и максимальному размеру
        const minWidth = 200;
        const minHeight = 150;
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.9;
        
        popup.style.width = Math.max(minWidth, Math.min(newWidth, maxWidth)) + 'px';
        popup.style.height = Math.max(minHeight, Math.min(newHeight, maxHeight)) + 'px';
        
        e.preventDefault();
        e.stopPropagation();
    }

    function stopResize() {
        isResizing = false;
        savePopupState();
    }

    document.addEventListener('mousemove', doResize);
    document.addEventListener('touchmove', doResize);
    document.addEventListener('mouseup', stopResize);
    document.addEventListener('touchend', stopResize);
        loadSize();

        return { overlay, popup, iframe, openBtn };
    }

    const { overlay, popup, iframe, openBtn } = createPopup();

    // Function to process and clean up the word
    function processWord(word) {
        return word
            .replace(/^[\s'‘—.–…"“”]+/, '') // Remove leading punctuation
            .replace(/[\s'‘,—.—–"“…:;”]+$/, '') // Remove trailing punctuation
            .replace(/[‘'’‘"“””]+/g, "'") // Normalize quotes
            .trim()
            .toLowerCase();
    }

    // Function to get the word under the cursor
    function getWordUnderCursor(event) {
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

    // Function to handle click events and display search results
    function handleClick(event) {
        if (!isEnabled) return; // Do nothing if the extension is disabled
        if (event.target.closest('a, button, input, textarea, select')) return; // Ignore clicks on interactive elements
        const clickedWord = getWordUnderCursor(event);
        if (clickedWord) {
            const processedWord = processWord(clickedWord);
            console.log('Word:', processedWord);
            const url = `${dpdlang}${encodeURIComponent(processedWord)}`; // Construct lookup URL
            iframe.src = url; // Load URL in iframe
            popup.style.display = 'block';
            overlay.style.display = 'block';
            openBtn.href = `${dhammaGiftURL}${encodeURIComponent(processedWord)}${dgParams}`; // Set open button URL
        }
    }

    const browserAPI = window.chrome || window.browser; // Universal check for Chrome and Edge

    // Initialize extension state
    browserAPI.storage.local.get(['isEnabled'], (result) => {
        isEnabled = result.isEnabled !== undefined ? result.isEnabled : true;
        if (isEnabled) {
            document.addEventListener('click', handleClick);
        }
    });

    // Listener for storage changes
    browserAPI.storage.onChanged.addListener((changes, namespace) => {
        if (changes.isEnabled) {
            isEnabled = changes.isEnabled.newValue;
            if (isEnabled) {
                document.addEventListener('click', handleClick);
            } else {
                document.removeEventListener('click', handleClick);
                popup.style.display = 'none';
                overlay.style.display = 'none';
            }
        }
    });

})();
