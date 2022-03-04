
export const isDev = () => !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

isDev() && chrome.commands.onCommand.addListener((shortcut) => {
  if (shortcut.includes("+M")) {
    chrome.runtime.reload();
  }
});
chrome.runtime.onInstalled.addListener(() => chrome.action.disable());
chrome.runtime.onStartup.addListener(() => chrome.action.disable());

chrome.tabs.onActivated.addListener((info) => {
  setIcon(info.tabId);
});

chrome.tabs.onUpdated.addListener((tabId) => {
  setIcon(tabId);
});

chrome.action.onClicked.addListener(function (tab) {
  // Send a message to the active tab
  tab.id && tab.active && chrome.tabs.sendMessage(tab.id,
    { "message": "clicked_browser_action" }
  );

});
const setIcon = async (tabId: number) => {
  const { url, id } = await chrome.tabs.get(tabId);
  if (url && id) {
    const isEnabled = url.startsWith("https://portal.ifood.com.br/");
    if (isEnabled) {
      chrome.action.enable(tabId);
      chrome.action.setIcon({ path: "/iconEnabled.png" });
    } else {
      chrome.action.disable(tabId);
      chrome.action.setIcon({ path: "/iconDisabled.png" });
    }
  }
};
