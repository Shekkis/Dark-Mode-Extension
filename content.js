let darkModeStyles = null;

async function initializeDarkMode() {
  const hostname = window.location.hostname;
  const settings = await chrome.storage.sync.get({
    globalEnabled: false,
    siteSettings: {},
    contrast: 100,
    brightness: 100
  });

  const siteSettings = settings.siteSettings[hostname];
  const isDarkModeEnabled = siteSettings?.enabled ?? settings.globalEnabled;
  
  if (isDarkModeEnabled) {
    applyDarkMode(siteSettings?.contrast ?? settings.contrast, 
                  siteSettings?.brightness ?? settings.brightness);
  } else {
    removeDarkMode();
  }
}

function applyDarkMode(contrast, brightness) {
  if (darkModeStyles) {
    darkModeStyles.remove();
  }

  darkModeStyles = document.createElement('style');
  darkModeStyles.textContent = `
    html {
      filter: invert(1) hue-rotate(180deg) 
              contrast(${contrast}%) brightness(${brightness}%) !important;
    }
    
    img, video, canvas, [style*="background-image"] {
      filter: invert(1) hue-rotate(180deg) !important;
    }
    
    @media (prefers-color-scheme: dark) {
      html {
        filter: none !important;
      }
      
      img, video, canvas, [style*="background-image"] {
        filter: none !important;
      }
    }
  `;
  
  document.head.appendChild(darkModeStyles);
}

function removeDarkMode() {
  if (darkModeStyles) {
    darkModeStyles.remove();
    darkModeStyles = null;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPDATE_DARK_MODE') {
    initializeDarkMode();
  }
});

initializeDarkMode();