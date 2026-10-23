/*
 * Material You New Tab
 * Copyright (c) 2024-2026 Prem, 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 */

// Open "What's New" page on update
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "update") {
        chrome.tabs.create({
            url: chrome.runtime.getURL("/docs/whats-new.html")
        });
    }
});

// Set uninstall URL
chrome.runtime.setUninstallURL(
    "https://forms.gle/gaR7EVS7XpzP3BsA6"
);

// Keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
    const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    });

    if (!tab?.id) {
        return;
    }

    try {
        switch (command) {
            case "random-wallpaper":
                await chrome.tabs.sendMessage(tab.id, {
                    action: "random-wallpaper"
                });
                break;
        }
    } catch (error) {
        console.debug(`Could not execute command "${command}":`, error);
    }
});
