chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "update") {
        chrome.tabs.create({
            url: chrome.runtime.getURL("/docs/whats-new.html")
        });
    }
});

chrome.runtime.setUninstallURL(
    "https://forms.gle/gaR7EVS7XpzP3BsA6"
);
