let currentTab = null;

document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;
  
  const hostname = new URL(tab.url).hostname;
  document.getElementById('currentSite').textContent = hostname;
  
  const settings = await chrome.storage.sync.get({
    globalEnabled: false,
    siteSettings: {},
    contrast: 100,
    brightness: 100
  });
  
  const globalToggle = document.getElementById('globalToggle');
  const siteToggle = document.getElementById('siteToggle');
  const contrastSlider = document.getElementById('contrast');
  const brightnessSlider = document.getElementById('brightness');
  
  globalToggle.checked = settings.globalEnabled;
  siteToggle.checked = settings.siteSettings[hostname]?.enabled ?? settings.globalEnabled;
  contrastSlider.value = settings.contrast;
  brightnessSlider.value = settings.brightness;
  
  globalToggle.addEventListener('change', async (e) => {
    await chrome.storage.sync.set({ globalEnabled: e.target.checked });
    updateContentScript();
  });
  
  siteToggle.addEventListener('change', async (e) => {
    const settings = await chrome.storage.sync.get({ siteSettings: {} });
    settings.siteSettings[hostname] = {
      enabled: e.target.checked,
      contrast: contrastSlider.value,
      brightness: brightnessSlider.value
    };
    await chrome.storage.sync.set({ siteSettings: settings.siteSettings });
    updateContentScript();
  });
  
  [contrastSlider, brightnessSlider].forEach(slider => {
    slider.addEventListener('change', async () => {
      const settings = await chrome.storage.sync.get({ siteSettings: {} });
      settings.siteSettings[hostname] = {
        enabled: siteToggle.checked,
        contrast: contrastSlider.value,
        brightness: brightnessSlider.value
      };
      await chrome.storage.sync.set({ siteSettings: settings.siteSettings });
      updateContentScript();
    });
  });
});

async function updateContentScript() {
  if (!currentTab) return;
  
  await chrome.tabs.sendMessage(currentTab.id, {
    type: 'UPDATE_DARK_MODE'
  });
}