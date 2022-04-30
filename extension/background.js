chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request, sender, sendResponse)
  if (request?.method == 'close_tab') {
    chrome.tabs.remove(sender.tab?.id)
  }
})