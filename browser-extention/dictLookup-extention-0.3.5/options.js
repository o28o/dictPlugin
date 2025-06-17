document.addEventListener('DOMContentLoaded', function() {
    const dictUrlInput = document.getElementById('dictUrl');
    const saveButton = document.getElementById('save');
    const statusDiv = document.getElementById('status');

    // Load saved settings
    chrome.storage.sync.get(['dictUrl'], function(result) {
        if (result.dictUrl) {
            dictUrlInput.value = result.dictUrl;
        }
    });

    // Save settings
    saveButton.addEventListener('click', function() {
        const dictUrl = dictUrlInput.value.trim();
        
        // Basic URL validation
        if (dictUrl && !dictUrl.includes('?q=')) {
            showStatus('Error: URL must contain "?q=" parameter', 'error');
            return;
        }

        chrome.storage.sync.set({ dictUrl: dictUrl }, function() {
            showStatus('Settings saved successfully!', 'success');
            

        });
    });

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = type;
        statusDiv.style.display = 'block';
        
        setTimeout(function() {
            statusDiv.style.display = 'none';
        }, 3000);
    }
});
