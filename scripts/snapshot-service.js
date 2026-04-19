/*
 * Material You NewTab
 * Copyright (c) 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

(function initializeSnapshotService() {
    const SNAPSHOT_SCHEMA_VERSION = 1;
    const SNAPSHOT_DATABASES = [
        {
            dbName: "ImageDB",
            version: 1,
            stores: ["backgroundImages"]
        }
    ];

    async function createSnapshot(options = {}) {
        const mode = options.mode || "full";
        return {
            schemaVersion: SNAPSHOT_SCHEMA_VERSION,
            snapshotType: mode,
            exportedAt: new Date().toISOString(),
            app: "MYNT",
            localStorage: collectLocalStorage(mode),
            indexedDB: await collectIndexedDB()
        };
    }

    function validateSnapshot(snapshot) {
        return !!snapshot
            && typeof snapshot === "object"
            && typeof snapshot.localStorage === "object"
            && typeof snapshot.indexedDB === "object";
    }

    function normalizeSnapshot(snapshot) {
        if (!snapshot || typeof snapshot !== "object") {
            return snapshot;
        }

        if (snapshot.localStorage && snapshot.indexedDB) {
            return snapshot;
        }

        return {
            schemaVersion: SNAPSHOT_SCHEMA_VERSION,
            snapshotType: "legacy",
            exportedAt: snapshot.exportedAt || new Date().toISOString(),
            app: "MYNT",
            localStorage: snapshot.localStorage || {},
            indexedDB: snapshot.indexedDB || {}
        };
    }

    async function restoreSnapshot(snapshot) {
        const normalizedSnapshot = normalizeSnapshot(snapshot);

        if (!validateSnapshot(normalizedSnapshot)) {
            throw new Error("Invalid snapshot format.");
        }

        localStorage.clear();
        Object.keys(normalizedSnapshot.localStorage).forEach((key) => {
            localStorage.setItem(key, normalizedSnapshot.localStorage[key]);
        });

        await restoreIndexedDB(normalizedSnapshot.indexedDB);
    }

    async function clearAllStoredData() {
        localStorage.clear();
        for (const databaseConfig of SNAPSHOT_DATABASES) {
            await clearDatabase(databaseConfig);
        }
    }

    function collectLocalStorage(mode) {
        const data = {};

        for (let key in localStorage) {
            if (!localStorage.hasOwnProperty(key)) {
                continue;
            }

            if (mode === "settings" && isTransientLocalStorageKey(key)) {
                continue;
            }

            data[key] = localStorage.getItem(key);
        }

        return data;
    }

    async function collectIndexedDB() {
        const databaseSnapshots = {};

        for (const databaseConfig of SNAPSHOT_DATABASES) {
            databaseSnapshots[databaseConfig.dbName] = await exportDatabase(databaseConfig);
        }

        return databaseSnapshots;
    }

    async function exportDatabase(databaseConfig) {
        const db = await openDatabase(databaseConfig);
        const stores = {};

        for (const storeName of databaseConfig.stores) {
            stores[storeName] = await exportObjectStore(db, storeName);
        }

        db.close();
        return stores;
    }

    async function exportObjectStore(db, storeName) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, "readonly");
            const store = transaction.objectStore(storeName);
            const data = {};

            store.getAllKeys().onsuccess = (keysEvent) => {
                const keys = keysEvent.target.result;

                if (!keys.length) {
                    resolve({});
                    return;
                }

                let pending = keys.length;
                keys.forEach((key) => {
                    store.get(key).onsuccess = async (getEvent) => {
                        try {
                            data[key] = await serializeIndexedDBValue(getEvent.target.result);
                            pending -= 1;
                            if (pending === 0) {
                                resolve(data);
                            }
                        } catch (error) {
                            reject(error);
                        }
                    };
                });
            };

            transaction.onerror = () => reject(transaction.error);
        });
    }

    async function restoreIndexedDB(indexedDBSnapshot) {
        for (const databaseConfig of SNAPSHOT_DATABASES) {
            const databaseSnapshot = indexedDBSnapshot?.[databaseConfig.dbName];
            await restoreDatabase(databaseConfig, databaseSnapshot || {});
        }
    }

    async function restoreDatabase(databaseConfig, databaseSnapshot) {
        const db = await openDatabase(databaseConfig);

        for (const storeName of databaseConfig.stores) {
            await restoreObjectStore(db, storeName, databaseSnapshot[storeName] || {});
        }

        db.close();
    }

    async function clearDatabase(databaseConfig) {
        const db = await openDatabase(databaseConfig);

        for (const storeName of databaseConfig.stores) {
            await restoreObjectStore(db, storeName, {});
        }

        db.close();
    }

    async function restoreObjectStore(db, storeName, storeData) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, "readwrite");
            const store = transaction.objectStore(storeName);
            const entries = Object.entries(storeData);

            store.clear();
            entries.forEach(([key, value]) => {
                store.put(deserializeIndexedDBValue(value), key);
            });

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    function openDatabase(databaseConfig) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(databaseConfig.dbName, databaseConfig.version);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                databaseConfig.stores.forEach((storeName) => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        db.createObjectStore(storeName);
                    }
                });
            };

            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = () => reject(new Error("Database error."));
        });
    }

    function isTransientLocalStorageKey(key) {
        return key.startsWith("quotes_")
            || key === "quotes_metadata_timestamp"
            || key === "weatherParsedData"
            || key === "weatherParsedTime"
            || key === "weatherParsedLocation"
            || key === "weatherParsedLang";
    }

    function serializeIndexedDBValue(value) {
        if (value instanceof Blob) {
            return blobToDataUrl(value).then((dataUrl) => ({
                serializedType: "blob",
                value: dataUrl,
                mimeType: value.type
            }));
        }

        return Promise.resolve({
            serializedType: "plain",
            value: value
        });
    }

    function deserializeIndexedDBValue(serializedValue) {
        if (!serializedValue || typeof serializedValue !== "object") {
            return serializedValue;
        }

        if (serializedValue.serializedType === "blob") {
            return dataUrlToBlob(serializedValue.value, serializedValue.mimeType);
        }

        return serializedValue.value;
    }

    function blobToDataUrl(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("Failed to serialize blob."));
            reader.readAsDataURL(blob);
        });
    }

    function dataUrlToBlob(dataUrl, mimeType) {
        const parts = dataUrl.split(",");
        const data = atob(parts[1]);
        const bytes = new Uint8Array(data.length);

        for (let index = 0; index < data.length; index += 1) {
            bytes[index] = data.charCodeAt(index);
        }

        return new Blob([bytes], { type: mimeType || "application/octet-stream" });
    }

    window.snapshotService = {
        createSnapshot,
        restoreSnapshot,
        validateSnapshot,
        normalizeSnapshot,
        clearAllStoredData
    };
})();
