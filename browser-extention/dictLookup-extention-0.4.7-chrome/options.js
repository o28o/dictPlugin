document.addEventListener('DOMContentLoaded', function() {
    // Добавляем эту строку для кросс-браузерности
    const browserApi = typeof browser !== 'undefined' ? browser : chrome;

    const urlPreset = document.getElementById('urlPreset');
    const customUrlContainer = document.getElementById('customUrlContainer');
    const customUrl = document.getElementById('customUrl');
    const saveButton = document.getElementById('save');
    const resetButton = document.getElementById('reset');
    const status = document.getElementById('status');
    
    // Показываем/скрываем поле для кастомного URL
    urlPreset.addEventListener('change', function() {
        if (this.value === 'custom') {
            customUrlContainer.style.display = 'block';
            customUrl.focus();
        } else {
            customUrlContainer.style.display = 'none';
        }
    });
    
    // Сохранение настроек
    saveButton.addEventListener('click', function() {
        let selectedValue;
        
        if (urlPreset.value === 'custom') {
            selectedValue = customUrl.value.trim();
            if (!selectedValue) {
                showStatus('Please enter a custom URL', 'error');
                return;
            }
            
            if (!selectedValue.includes('?q=') && !selectedValue.includes('?search=')) {
                showStatus('Error: Custom URL for popup must contain "?q=" or "?search=" parameter', 'error');
                return;
            }
        } else {
            selectedValue = urlPreset.value;
        }
        
        // Используем browserApi вместо chrome
        browserApi.storage.sync.set({ dictUrl: selectedValue }, function() {
            if (browserApi.runtime.lastError) {
                showStatus(`Error: ${browserApi.runtime.lastError.message}`, 'error');
            } else {
                showStatus('Saved! Refresh the reading page if needed', 'success');
            }
        });
    });

    // Сброс настроек
    resetButton.addEventListener('click', function() {
        // Используем browserApi вместо chrome
        browserApi.storage.sync.remove('dictUrl', function() {
            browserApi.storage.local.set({ 'popup_reset_flag': true });
            browserApi.runtime.sendMessage({ action: 'reset_extension_state' });
            
            urlPreset.selectedIndex = 0;
            customUrlContainer.style.display = 'none';
            customUrl.value = '';
            
            showStatus('Settings reset. Please reload any pages where the extension is active.', 'success');
        });
    });
    
    // Загрузка сохраненных настроек
    // Используем browserApi вместо chrome
    browserApi.storage.sync.get(['dictUrl'], function(result) {
        if (result.dictUrl) {
            const options = Array.from(urlPreset.options);
            const foundOption = options.find(option => option.value === result.dictUrl);
            
            if (foundOption) {
                urlPreset.value = result.dictUrl;
            } else {
                urlPreset.value = 'custom';
                customUrlContainer.style.display = 'block';
                customUrl.value = result.dictUrl;
            }
        }
    });
    
    function showStatus(message, type) {
        status.textContent = message;
        status.className = type;
        status.style.display = 'block';
        
        setTimeout(function() {
            status.style.display = 'none';
        }, 3000);
    }
});