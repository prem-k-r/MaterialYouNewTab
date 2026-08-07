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
const SYNC_CHUNK_BYTE_LIMIT = 7000; // Per-item sync quota is 8192 bytes of key + JSON-escaped value
const SYNC_DEBOUNCE_MS = 2500; // Sync storage limits sustained writes (~120/min)

// Firefox's browser.* is promise-based; Chromium's chrome.* may be callback-only
const syncStorage = (() => {
    if (typeof browser !== "undefined" && browser.storage?.sync) return browser.storage.sync;
    if (typeof chrome !== "undefined" && chrome.storage?.sync) {
        const api = chrome.storage.sync;
        const promisify = (method) => (arg) => new Promise((resolve, reject) => {
            method.call(api, arg, (result) => {
                const error = chrome.runtime.lastError;
                error ? reject(new Error(error.message)) : resolve(result);
            });
        });
        return { get: promisify(api.get), set: promisify(api.set), remove: promisify(api.remove) };
    }
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

// Worst-case UTF-8 byte size of one UTF-16 code unit after JSON escaping
function jsonByteCost(code) {
    if (code === 0x22 || code === 0x5C) return 2; // " and \ escape to two chars
    if (code < 0x20) return 6; // Control chars escape to \u00XX
    if (code < 0x80) return 1;
    if (code < 0x800) return 2;
    if (code >= 0xD800 && code <= 0xDFFF) return 6; // Lone surrogates escape to \uXXXX
    return 3;
}

// Split by encoded byte size: quotas count bytes, not string length
function splitIntoChunks(payload) {
    const chunks = [];
    let start = 0;
    let bytes = 0;
    for (let i = 0; i < payload.length; i++) {
        const cost = jsonByteCost(payload.charCodeAt(i));
        if (bytes + cost > SYNC_CHUNK_BYTE_LIMIT) {
            chunks.push(payload.slice(start, i));
            start = i;
            bytes = 0;
        }
        bytes += cost;
    }
    chunks.push(payload.slice(start));
    return chunks;
}

function isValidSnapshotData(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) return false;
    return Object.values(data).every((value) => typeof value === "string");
}

async function readRemoteSnapshot() {
    const meta = (await syncStorage.get(SYNC_META_KEY))[SYNC_META_KEY];
    if (!meta || typeof meta.timestamp !== "number" || typeof meta.gen !== "string"
        || !Number.isInteger(meta.chunks) || meta.chunks < 1) return null;

    const chunkKeys = Array.from({ length: meta.chunks }, (_, i) => SYNC_CHUNK_PREFIX + meta.gen + "_" + i);
    const stored = await syncStorage.get(chunkKeys);

    let payload = "";
    for (const key of chunkKeys) {
        if (typeof stored[key] !== "string") return null;
        payload += stored[key];
    }

    try {
        const data = JSON.parse(payload);
        if (!isValidSnapshotData(data)) return null;
        return { timestamp: meta.timestamp, data };
    } catch (error) {
        console.error("Cloud sync: stored snapshot is corrupt.", error);
        return null;
    }
}

let pushTimer = null;
let applyingRemote = false;
let pendingRemoteCheck = false;

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
        const chunks = splitIntoChunks(JSON.stringify(collectSnapshot()));
        const timestamp = Date.now();
        const gen = timestamp.toString(36);

        // Chunk keys are generation-specific so concurrent pushes from two devices never
        // reference each other's chunks; meta and chunks land together in one set()
        const data = { [SYNC_META_KEY]: { version: 1, timestamp, gen, chunks: chunks.length } };
        chunks.forEach((chunk, i) => {
            data[SYNC_CHUNK_PREFIX + gen + "_" + i] = chunk;
        });
        await syncStorage.set(data);
        localStorage.setItem(SYNC_LAST_SYNCED_KEY, String(timestamp));

        // Chunks from any generation not referenced by current meta (and not just written) are orphans
        const all = await syncStorage.get(null);
        const activeGen = all[SYNC_META_KEY]?.gen;
        const stale = Object.keys(all).filter((key) =>
            key.startsWith(SYNC_CHUNK_PREFIX)
            && !key.startsWith(SYNC_CHUNK_PREFIX + gen + "_")
            && !(activeGen && key.startsWith(SYNC_CHUNK_PREFIX + activeGen + "_")));
        if (stale.length) {
            await syncStorage.remove(stale);
        }
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

// Reloading is fine on a fresh page, but never yank the tab once the user has started using it
let userInteracted = false;
window.addEventListener("pointerdown", () => { userInteracted = true; }, { once: true });
window.addEventListener("keydown", () => { userInteracted = true; }, { once: true });

// Newest-wins: apply the cloud snapshot only if newer than the last one this device pushed or applied
async function pullIfRemoteNewer() {
    const remote = await readRemoteSnapshot();
    if (!remote) return;

    const lastSynced = Number(localStorage.getItem(SYNC_LAST_SYNCED_KEY) || 0);
    if (remote.timestamp <= lastSynced) return;

    if (!document.hidden && userInteracted) {
        pendingRemoteCheck = true;
        return;
    }
    applyRemoteSnapshot(remote);
}

// Every setting is persisted through localStorage, so wrapping the Storage
// methods catches all settings changes without touching each feature
const originalSetItem = Storage.prototype.setItem;
const originalRemoveItem = Storage.prototype.removeItem;
const originalClear = Storage.prototype.clear;

Storage.prototype.setItem = function (key, value) {
    originalSetItem.call(this, key, value);
    if (this === window.localStorage && !SYNC_EXCLUDED_KEYS.includes(key)) schedulePush();
};
Storage.prototype.removeItem = function (key) {
    originalRemoveItem.call(this, key);
    if (this === window.localStorage && !SYNC_EXCLUDED_KEYS.includes(key)) schedulePush();
};
Storage.prototype.clear = function () {
    originalClear.call(this);
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
