// Check the language in localStorage
const siteLanguage = localStorage.getItem('siteLanguage');

// Set the correct URL for the dictionary depending on the language
let dpdlang;

// Condition to check the site language and URL
if (window.location.href.includes('/ru/') || window.location.href.includes('ml.html')) {
  dpdlang = 'https://dpdict.net/ru/';
} else {
  dpdlang = 'https://dpdict.net/';
}

// Create elements for Popup with resizing and dragging functionality
function createPopup() {
  const overlay = document.createElement('div');
  overlay.classList.add('overlay');

  const popup = document.createElement('div');
  popup.classList.add('popup');
  popup.style.position = 'fixed';

  // Set saved sizes and positions, if available
  const savedWidth = localStorage.getItem('popupWidth');
  const savedHeight = localStorage.getItem('popupHeight');
  const savedTop = localStorage.getItem('popupTop');
  const savedLeft = localStorage.getItem('popupLeft');

  if (savedWidth) popup.style.width = savedWidth;
  if (savedHeight) popup.style.height = savedHeight;
  if (savedTop) popup.style.top = savedTop;
  if (savedLeft) popup.style.left = savedLeft;

  const closeBtn = document.createElement('button');
  closeBtn.classList.add('close-btn');
  closeBtn.innerHTML = '<img src="assets/svg/xmark.svg" class=""></img>';

  const iframe = document.createElement('iframe');
  iframe.src = '';
  iframe.style.width = '100%';
  iframe.style.height = 'calc(100% - 10px)'; // Leave space for the header

  // Add header for dragging
  const header = document.createElement('div');
  header.classList.add('popup-header');
  header.style.cursor = 'move';
  header.style.height = '10px';
  header.style.background = '#f1f1f1';
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.padding = '0 10px';
  header.textContent = '';

  popup.appendChild(header);
  popup.appendChild(closeBtn);
  popup.appendChild(iframe);

  // Add popup and overlay to the page
  document.body.appendChild(overlay);
  document.body.appendChild(popup);

  // Function to save position and size
  function savePopupState() {
    localStorage.setItem('popupWidth', popup.style.width);
    localStorage.setItem('popupHeight', popup.style.height);
    localStorage.setItem('popupTop', popup.style.top);
    localStorage.setItem('popupLeft', popup.style.left);
  }

  // Dragging functionality
  let isDragging = false;
  let startX, startY, initialLeft, initialTop;

  // Mouse down handler (desktop)
  function startDrag(e) {
    isDragging = true;
    startX = e.clientX || e.touches[0].clientX; // Support for touch devices
    startY = e.clientY || e.touches[0].clientY;
    initialLeft = parseInt(popup.style.left || 0, 10);
    initialTop = parseInt(popup.style.top || 0, 10);
    e.preventDefault();
  }

  // Mouse move handler (desktop)
  function moveDrag(e) {
    if (isDragging) {
      const deltaX = (e.clientX || e.touches[0].clientX) - startX;
      const deltaY = (e.clientY || e.touches[0].clientY) - startY;
      popup.style.left = `${initialLeft + deltaX}px`;
      popup.style.top = `${initialTop + deltaY}px`;
    }
  }

  // Mouse up handler (desktop)
  function stopDrag() {
    if (isDragging) {
      isDragging = false;
      savePopupState();
    }
  }

  // Drag handlers for desktop
  header.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', moveDrag);
  document.addEventListener('mouseup', stopDrag);

  // Drag handlers for mobile devices
  header.addEventListener('touchstart', startDrag);
  document.addEventListener('touchmove', moveDrag);
  document.addEventListener('touchend', stopDrag);

  // Resizing functionality
  popup.style.resize = 'both';
  popup.style.overflow = 'auto';

  const resizeObserver = new ResizeObserver(() => {
    savePopupState();
  });
  resizeObserver.observe(popup);

  return { overlay, popup, closeBtn, iframe };
}

// Insert popup into the page
const { overlay, popup, closeBtn, iframe } = createPopup();

// Close popup when clicking the button or overlay
closeBtn.addEventListener('click', () => {
  popup.style.display = 'none';
  overlay.style.display = 'none';
  iframe.src = ''; // Clear iframe
});

overlay.addEventListener('click', () => {
  popup.style.display = 'none';
  overlay.style.display = 'none';
  iframe.src = ''; // Clear iframe
});

console.log('lookup dict ', dpdlang, ' siteLanguage ', siteLanguage);

// Check state in localStorage when the page loads
let dictionaryVisible = localStorage.getItem('dictionaryVisible') === 'true';

const toggleBtn = document.querySelector('.toggle-dict-btn');
if (dictionaryVisible) {
  toggleBtn.innerHTML = '<img class="dictIcon" src="assets/svg/comment.svg"></img>';
} else {
  toggleBtn.innerHTML = '<img class="dictIcon" src="assets/svg/comment-slash.svg"></img>';
}

// Toggle button handler for enabling/disabling dictionary visibility
toggleBtn.addEventListener('click', () => {
  dictionaryVisible = !dictionaryVisible;

  // Save state in localStorage
  localStorage.setItem('dictionaryVisible', dictionaryVisible);

  if (dictionaryVisible) {
    toggleBtn.innerHTML = '<img class="dictIcon" src="assets/svg/comment.svg"></img>';
  } else {
    toggleBtn.innerHTML = '<img class="dictIcon" src="assets/svg/comment-slash.svg"></img>';
  }
});

// Click event handler for word lookup
document.addEventListener('click', function(event) {
    // Check if the click was on an element with the "pli-lang" class
    if (event.target.closest('.pli-lang')) { // Account for nested elements
        const clickedWord = getClickedWordWithHTML(event.target, event.clientX, event.clientY);

        // If the click was on an <a> link, do nothing
        if (event.target.closest('a')) {
            return;
        }

        if (clickedWord) {
            // Remove quotes or apostrophes at the beginning of the word
            const cleanedWord = cleanWord(clickedWord);
            console.log('Clicked word:', cleanedWord);

            if (dictionaryVisible) {
                const url = `${dpdlang}search_html?q=${encodeURIComponent(cleanedWord)}`;
                iframe.src = url;
                popup.style.display = 'block';
                overlay.style.display = 'block';
            }
        }
    }
});

// Function to determine the clicked word, considering nested HTML
function getClickedWordWithHTML(element, x, y) {
    // Get the range based on coordinates
    const range = document.caretRangeFromPoint(x, y);
    if (!range) return null;

    // Find the parent element with the full text
    const parentElement = element.closest('.pli-lang'); // Ensure it's the top element
    if (!parentElement) {
        console.log('Parent element with the "pli-lang" class not found.');
        return null;
    }

    // Get the full text of the parent element
    const fullText = getFullTextFromElement(parentElement);

    // Calculate the global offset in the full text
    const globalOffset = calculateOffsetWithHTML(parentElement, range.startContainer, range.startOffset);
    if (globalOffset === -1) {
        console.error('Failed to calculate global offset.');
        return null;
    }

    console.log('Offset in the full text:', globalOffset);

    // Find the word boundaries from space to space
    const start = fullText.lastIndexOf(' ', globalOffset - 1) + 1; // After the last space
    const end = fullText.indexOf(' ', globalOffset);
    const word = fullText.slice(start, end === -1 ? undefined : end);

    console.log('Found word:', word);
    return word;
}

// Function to get the full text of an element (entire line)
function getFullTextFromElement(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);

    let node;
    while ((node = walker.nextNode())) {
        textNodes.push(node.textContent); // Collect the text of all text nodes
    }

    const combinedText = textNodes.join(''); // Combine into a single string
    console.log('Text of all nodes:', combinedText);
    return combinedText;
}

// Function to calculate the global offset
function calculateOffsetWithHTML(element, targetNode, targetOffset) {
    let offset = 0;

    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    let node;

    while ((node = walker.nextNode())) {
        if (node === targetNode) {
            return offset + targetOffset; // Return global offset
        }
        offset += node.textContent.length;
    }

    console.log('Target node not found.');
    return -1;
}

// Function to clean the word from unnecessary characters
function cleanWord(word) {
    return word
        .replace(/^[\s'‘—.–…"“”]+/, '') // Remove characters at the start, including spaces and dashes
        .replace(/[\s'‘,—.—–"“…:;”]+$/, '') // Remove characters at the end, including spaces and dashes
        .toLowerCase();
}
