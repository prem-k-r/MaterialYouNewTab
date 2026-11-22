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

// Open feedback form on uninstall
chrome.runtime.setUninstallURL(
    "https://forms.gle/gaR7EVS7XpzP3BsA6"
);

// The key combination currently assigned to a command
async function getCommandShortcut(name) {
    const commands = await chrome.commands.getAll();
    return commands.find(command => command.name === name)?.shortcut || "unassigned";
}

// Keyboard shortcuts
chrome.commands.onCommand.addListener(async (command, tab) => {
    try {
        if (!tab?.id) {
            [tab] = await chrome.tabs.query({
                active: true,
                lastFocusedWindow: true
            });
        }
        if (!tab?.id) return;
        let message;
        switch (command) {
            case "open-bookmarks":
                message = {
                    action: "toggle-bookmarks",
                    tabId: tab.id
                };
                break;
            default:
                return;
        }
        await chrome.runtime.sendMessage(message);
    } catch (error) {
        const shortcut = await getCommandShortcut(command).catch(() => "unknown");
        console.debug(`Could not execute command "${command}" (${shortcut}):`, error);
    }
});
