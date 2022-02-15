chrome.commands.onCommand.addListener((shortcut) => {
  console.log("lets reload");
  console.log(shortcut);
  if (shortcut.includes("+M")) {
    chrome.runtime.reload();
  }
});
chrome.runtime.onStartup.addListener(function () {
  chrome.tabs.onActivated.addListener(async (info) => {
    const tab = await chrome.tabs.get(info.tabId);
    const isPortalIfood = tab.url?.startsWith("https://portal.ifood.com.br/");
    isPortalIfood
      ? chrome.action.enable(tab.id)
      : chrome.action.disable(tab.id);
  });
});

chrome.runtime.onInstalled.addListener(function () {
  chrome.tabs.onActivated.addListener(async (info) => {
    const tab = await chrome.tabs.get(info.tabId);
    const isPortalIfood = tab.url?.startsWith("https://portal.ifood.com.br/");
    isPortalIfood
      ? chrome.action.enable(tab.id)
      : chrome.action.disable(tab.id);
  });
});
