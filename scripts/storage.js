/*
 * Material You NewTab
 * Copyright (c) 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

// --------------- Centralized Storage Wrapper ---------------
// Uses chrome.storage.sync on Chrome, browser.storage.local on Firefox.
// Falls back to localStorage if chrome.storage is unavailable (e.g., website preview).

(function () {
    // Keys that must remain in localStorage (not synced):
    // quotes_*        : large quote arrays, exceed chrome.storage.sync item quota
    // LoadingScreenColor : computed value used by preload.js for fast synchronous read
    // weatherParsed*  : ephemeral API cache, not worth syncing across devices
    function _isLocalOnly(key) {
        return key.startsWith("quotes_")
            || key === "LoadingScreenColor"
            || key === "weatherParsedData"
            || key === "weatherParsedTime"
            || key === "weatherParsedLocation"
            || key === "weatherParsedLang";
    }

    // Firefox detection (browser-utils.js has not loaded yet at this point)
    const _isFirefox = typeof browser !== "undefined" && /firefox/i.test(navigator.userAgent);

    // Return the appropriate storage area for settings
    function _getStorageArea() {
        if (_isFirefox) {
            return (typeof browser !== "undefined" && browser.storage && browser.storage.local) || null;
        }
        if (typeof chrome !== "undefined" && chrome.storage) {
            return chrome.storage.sync || chrome.storage.local || null;
        }
        return null;
    }

    // Internal key to track whether migration from localStorage has been done
    const MIGRATION_KEY = "_storage_migrated";

    // In-memory cache: synchronously pre-populated from localStorage so that
    // defer scripts can read settings immediately before chrome.storage resolves.
    const _cache = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!_isLocalOnly(key)) _cache[key] = localStorage.getItem(key);
    }

    // One-time migration: copy all non-local-only localStorage keys to chrome.storage,
    // then remove them from localStorage so there is a single source of truth.
    async function _migrate(storageArea) {
        const result = await storageArea.get(MIGRATION_KEY);
        if (result[MIGRATION_KEY]) return; // Already migrated

        const toMigrate = { [MIGRATION_KEY]: true };
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!_isLocalOnly(key)) toMigrate[key] = localStorage.getItem(key);
        }

        await storageArea.set(toMigrate);

        // Remove migrated keys from localStorage (preserves local-only keys)
        Object.keys(toMigrate).forEach(key => {
            if (key !== MIGRATION_KEY) localStorage.removeItem(key);
        });
    }

    // Promise that resolves once chrome.storage is loaded and cache is up-to-date.
    // DOMContentLoaded handlers that need accurate settings should await this.
    window.storageReady = (async () => {
        const storageArea = _getStorageArea();
        if (!storageArea) return; // No chrome.storage available; cache serves as localStorage proxy

        await _migrate(storageArea);

        // Load all settings from chrome.storage into the in-memory cache
        const items = await storageArea.get(null);
        Object.assign(_cache, items);

        // Listen for external changes (e.g., sync data arriving from another device)
        const onChanged = _isFirefox
            ? (typeof browser !== "undefined" && browser.storage && browser.storage.onChanged)
            : (typeof chrome !== "undefined" && chrome.storage && chrome.storage.onChanged);

        if (onChanged) {
            onChanged.addListener((changes) => {
                for (const [key, { newValue }] of Object.entries(changes)) {
                    if (newValue !== undefined) _cache[key] = newValue;
                    else delete _cache[key];
                }
            });
        }
    })();

    // ---------- Public Storage API ----------

    window.Storage = {
        // Synchronous read from cache (or localStorage for local-only keys).
        // Safe to call at any time; returns null if key does not exist.
        getItem(key) {
            if (_isLocalOnly(key)) return localStorage.getItem(key);
            return Object.prototype.hasOwnProperty.call(_cache, key) ? _cache[key] : null;
        },

        // Write to cache immediately and persist to chrome.storage (fire-and-forget).
        // Callers do not need to await this.
        setItem(key, value) {
            if (_isLocalOnly(key)) { localStorage.setItem(key, value); return; }
            _cache[key] = value;
            const storageArea = _getStorageArea();
            if (storageArea) storageArea.set({ [key]: value });
            else localStorage.setItem(key, value);
        },

        // Remove from cache and from chrome.storage (fire-and-forget).
        removeItem(key) {
            if (_isLocalOnly(key)) { localStorage.removeItem(key); return; }
            delete _cache[key];
            const storageArea = _getStorageArea();
            if (storageArea) storageArea.remove(key);
            else localStorage.removeItem(key);
        },

        // Clear all synced settings but keep the migration marker so re-migration
        // is not triggered on next load. Used by the reset-settings button.
        reset() {
            const storageArea = _getStorageArea();
            const keysToRemove = Object.keys(_cache).filter(k => k !== MIGRATION_KEY);
            keysToRemove.forEach(key => delete _cache[key]);
            if (storageArea) return storageArea.remove(keysToRemove);
            keysToRemove.forEach(key => localStorage.removeItem(key));
        },

        // Clear ALL chrome.storage including the migration marker. Used before
        // restoring a backup so old data does not bleed through.
        clearForRestore() {
            const storageArea = _getStorageArea();
            Object.keys(_cache).forEach(key => delete _cache[key]);
            if (storageArea) return storageArea.clear();
            // Fallback: clear only non-local-only keys from localStorage
            const toKeep = {};
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (_isLocalOnly(k)) toKeep[k] = localStorage.getItem(k);
            }
            localStorage.clear();
            Object.entries(toKeep).forEach(([k, v]) => localStorage.setItem(k, v));
        },

        // Return all synced settings as a plain object (used for backup).
        async getAll() {
            const storageArea = _getStorageArea();
            let items;
            if (storageArea) {
                items = await storageArea.get(null);
            } else {
                items = { ..._cache };
            }
            const result = { ...items };
            delete result[MIGRATION_KEY];
            return result;
        },

        // Write a batch of settings and mark migration as done (used for restore).
        async setAll(obj) {
            const dataWithMarker = { ...obj, [MIGRATION_KEY]: true };
            Object.entries(dataWithMarker).forEach(([key, val]) => { _cache[key] = val; });
            const storageArea = _getStorageArea();
            if (storageArea) return storageArea.set(dataWithMarker);
            Object.entries(dataWithMarker).forEach(([key, val]) => localStorage.setItem(key, val));
        }
    };
})();
