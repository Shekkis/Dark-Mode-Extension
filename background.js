chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    globalEnabled: false,
    siteSettings: {},
    contrast: 100,
    brightness: 100
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabId, { type: 'UPDATE_DARK_MODE' });
  }
});