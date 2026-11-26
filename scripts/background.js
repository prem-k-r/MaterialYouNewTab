/*
 * Material You New Tab
 * Copyright (c) 2024-2026 Prem, 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 */

// Open "What's New" page on update
chrome.runtime.onInstalled.addListener((details) => {
    const currentVersion = chrome.runtime.getManifest().version;
    if (details.reason === "update" && details.previousVersion !== currentVersion) {
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

const COMMAND_ACTIONS = {
    "open-bookmarks": "toggle-bookmarks",
    "toggle-ai-tools": "toggle-ai-tools",
    "toggle-todo": "toggle-todo",
    "toggle-settings": "toggle-settings",
    "toggle-google-apps": "toggle-google-apps",
    "voice-search": "voice-search"
};

// Keyboard shortcuts
chrome.commands.onCommand.addListener(async (command, tab) => {
    try {
        const action = COMMAND_ACTIONS[command];
        if (!action) return;

        if (!tab?.id) {
            [tab] = await chrome.tabs.query({
                active: true,
                lastFocusedWindow: true
            });
        }
        if (!tab?.id) return;

        await chrome.runtime.sendMessage({
            action,
            tabId: tab.id
        });
    } catch (error) {
        const shortcut = await getCommandShortcut(command).catch(() => "unknown");
        console.debug(`Could not execute command "${command}" (${shortcut}):`, error);
    }
});
