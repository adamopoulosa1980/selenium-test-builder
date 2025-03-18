chrome.action.onClicked.addListener((tab) => {
    console.log("Toolbar icon clicked, sending togglePanel to tab ID:", tab.id);
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
            chrome.runtime.sendMessage({ action: "togglePanel" });
        }
    });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "download") {
        console.log("Downloading test snippet");
        chrome.downloads.download({
            url: 'data:text/plain;charset=utf-8,' + encodeURIComponent(message.content),
            filename: message.filename
        });
    }
});