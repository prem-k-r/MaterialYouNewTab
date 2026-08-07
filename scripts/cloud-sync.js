/*
 * Material You NewTab
 * Copyright (c) 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

// -------------------- Cloud Sync ----------------------
// Mirrors localStorage settings to storage.sync (synced through the user's browser account).
// Wallpaper images (IndexedDB) exceed the ~100 KB sync quota and stay on-device.

const cloudSyncCheckbox = document.getElementById("cloudSyncCheckbox");

const SYNC_ENABLED_KEY = "cloudSyncEnabled";
const SYNC_LAST_SYNCED_KEY = "cloudSyncLastSynced";
// Device-local keys: "hasWallpaper" refers to an image that only exists in this device's IndexedDB
const SYNC_EXCLUDED_KEYS = [SYNC_ENABLED_KEY, SYNC_LAST_SYNCED_KEY, "hasWallpaper"];

const SYNC_META_KEY = "syncMeta";
const SYNC_CHUNK_PREFIX = "syncChunk_";
const SYNC_CHUNK_SIZE = 4000; // Keeps each item under the 8 KB per-item sync quota after JSON escaping
const SYNC_DEBOUNCE_MS = 2500; // Sync storage limits sustained writes (~120/min)

const syncStorage = (() => {
    try {
        if (typeof browser !== "undefined" && browser.storage?.sync) return browser.storage.sync;
        if (typeof chrome !== "undefined" && chrome.storage?.sync) return chrome.storage.sync;
    } catch (e) { }
    return null;
})();

function isCloudSyncEnabled() {
    return localStorage.getItem(SYNC_ENABLED_KEY) === "checked";
}

function collectSnapshot() {
    const snapshot = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!SYNC_EXCLUDED_KEYS.includes(key)) {
            snapshot[key] = localStorage.getItem(key);
        }
    }
    return snapshot;
}

async function readRemoteSnapshot() {
    const meta = (await syncStorage.get(SYNC_META_KEY))[SYNC_META_KEY];
    if (!meta || !meta.chunks || !meta.timestamp) return null;

    const chunkKeys = Array.from({ length: meta.chunks }, (_, i) => SYNC_CHUNK_PREFIX + i);
    const stored = await syncStorage.get(chunkKeys);

    let payload = "";
    for (const key of chunkKeys) {
        if (typeof stored[key] !== "string") return null;
        payload += stored[key];
    }

    try {
        return { timestamp: meta.timestamp, data: JSON.parse(payload) };
    } catch (error) {
        console.error("Cloud sync: stored snapshot is corrupt.", error);
        return null;
    }
}

let pushTimer = null;
let applyingRemote = false;

function schedulePush() {
    if (!syncStorage || !isCloudSyncEnabled() || applyingRemote) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => {
        pushTimer = null;
        pushSnapshot();
    }, SYNC_DEBOUNCE_MS);
}

async function pushSnapshot() {
    if (!syncStorage || !isCloudSyncEnabled()) return;
    try {
        const payload = JSON.stringify(collectSnapshot());
        const chunkCount = Math.max(1, Math.ceil(payload.length / SYNC_CHUNK_SIZE));
        const timestamp = Date.now();

        const data = { [SYNC_META_KEY]: { version: 1, timestamp, chunks: chunkCount } };
        for (let i = 0; i < chunkCount; i++) {
            data[SYNC_CHUNK_PREFIX + i] = payload.slice(i * SYNC_CHUNK_SIZE, (i + 1) * SYNC_CHUNK_SIZE);
        }

        const previousMeta = (await syncStorage.get(SYNC_META_KEY))[SYNC_META_KEY];
        await syncStorage.set(data);

        // Remove chunks left over from a larger previous snapshot
        if (previousMeta?.chunks > chunkCount) {
            const staleKeys = [];
            for (let i = chunkCount; i < previousMeta.chunks; i++) {
                staleKeys.push(SYNC_CHUNK_PREFIX + i);
            }
            await syncStorage.remove(staleKeys);
        }

        localStorage.setItem(SYNC_LAST_SYNCED_KEY, String(timestamp));
    } catch (error) {
        console.error("Cloud sync push failed:", error);
        if (String(error?.message || error).toLowerCase().includes("quota")) {
            await alertPrompt(translations[currentLanguage]?.cloudSyncQuotaError || translations["en"].cloudSyncQuotaError);
        }
    }
}

function applyRemoteSnapshot(remote) {
    applyingRemote = true;
    try {
        for (const key of Object.keys(localStorage)) {
            if (!SYNC_EXCLUDED_KEYS.includes(key) && !(key in remote.data)) {
                localStorage.removeItem(key);
            }
        }
        for (const [key, value] of Object.entries(remote.data)) {
            if (!SYNC_EXCLUDED_KEYS.includes(key)) {
                localStorage.setItem(key, value);
            }
        }
        localStorage.setItem(SYNC_LAST_SYNCED_KEY, String(remote.timestamp));
    } finally {
        applyingRemote = false;
    }
    location.reload();
}

// Newest-wins: apply the cloud snapshot only if newer than the last one this device pushed or applied
async function pullIfRemoteNewer() {
    const remote = await readRemoteSnapshot();
    if (!remote) return;

    const lastSynced = Number(localStorage.getItem(SYNC_LAST_SYNCED_KEY) || 0);
    if (remote.timestamp > lastSynced) {
        applyRemoteSnapshot(remote);
    }
}

// Every setting is persisted through localStorage, so wrapping the Storage
// methods catches all settings changes without touching each feature
const originalSetItem = Storage.prototype.setItem;
const originalRemoveItem = Storage.prototype.removeItem;
const originalClear = Storage.prototype.clear;

Storage.prototype.setItem = function (key) {
    originalSetItem.apply(this, arguments);
    if (this === window.localStorage && !SYNC_EXCLUDED_KEYS.includes(key)) schedulePush();
};
Storage.prototype.removeItem = function (key) {
    originalRemoveItem.apply(this, arguments);
    if (this === window.localStorage && !SYNC_EXCLUDED_KEYS.includes(key)) schedulePush();
};
Storage.prototype.clear = function () {
    originalClear.apply(this, arguments);
    if (this === window.localStorage) schedulePush();
};

// Flush a pending push when the tab is closed
window.addEventListener("pagehide", () => {
    if (pushTimer !== null) {
        clearTimeout(pushTimer);
        pushTimer = null;
        pushSnapshot();
    }
});

if (!syncStorage) {
    // Not running as an extension: hide the toggle
    document.getElementById("cloudSyncToggleCont").style.display = "none";
} else {
    cloudSyncCheckbox.checked = isCloudSyncEnabled();

    cloudSyncCheckbox.addEventListener("change", async () => {
        if (!cloudSyncCheckbox.checked) {
            localStorage.setItem(SYNC_ENABLED_KEY, "unchecked");
            return;
        }

        const firstSync = !localStorage.getItem(SYNC_LAST_SYNCED_KEY);
        localStorage.setItem(SYNC_ENABLED_KEY, "checked");

        // First enable on this device with data already in the cloud: let the user choose which side wins
        const remote = firstSync ? await readRemoteSnapshot() : null;
        if (remote) {
            const message = translations[currentLanguage]?.cloudSyncPullConfirm || translations["en"].cloudSyncPullConfirm;
            if (await confirmPrompt(message)) {
                applyRemoteSnapshot(remote);
                return;
            }
        }
        pushSnapshot();
    });

    // Another device pushed while this tab is open: apply once the tab is
    // hidden, so an in-use new tab is never reloaded mid-interaction
    let pendingRemoteCheck = false;
    const storageEvents = (typeof browser !== "undefined" ? browser : chrome).storage.onChanged;
    storageEvents.addListener((changes, areaName) => {
        if (areaName !== "sync" || !changes[SYNC_META_KEY] || !isCloudSyncEnabled()) return;
        if (document.hidden) {
            pullIfRemoteNewer();
        } else {
            pendingRemoteCheck = true;
        }
    });
    document.addEventListener("visibilitychange", () => {
        if (document.hidden && pendingRemoteCheck && isCloudSyncEnabled()) {
            pendingRemoteCheck = false;
            pullIfRemoteNewer();
        }
    });

    if (isCloudSyncEnabled()) {
        pullIfRemoteNewer();
    }
}
