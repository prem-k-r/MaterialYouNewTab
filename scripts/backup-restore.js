/*
 * Material You NewTab
 * Copyright (c) 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

// -------------------- Backup-Restore Settings ----------------------
document.getElementById("backupBtn").addEventListener("click", backupData);
document.getElementById("restoreBtn").addEventListener("click", () => document.getElementById("fileInput").click());
document.getElementById("fileInput").addEventListener("change", validateAndRestoreData);

// Backup data from Storage API, localStorage (local-only keys) and IndexedDB
async function backupData() {
    try {
        const backup = { localStorage: {}, chromeStorage: {}, indexedDB: {} };

        // Backup local-only keys from localStorage (quotes, weather cache, etc.)
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                backup.localStorage[key] = localStorage.getItem(key);
            }
        }

        // Backup all synced settings from chrome.storage via Storage wrapper
        backup.chromeStorage = await Storage.getAll();

        // Backup IndexedDB (ImageDB)
        backup.indexedDB = await backupIndexedDB();

        // Generate filename with current date (format: DDMMYYYY)
        const date = new Date();
        const formattedDate = `${String(date.getDate()).padStart(2, "0")}${String(date.getMonth() + 1).padStart(2, "0")}${date.getFullYear()}`;
        const fileName = `MYNT_Backup_${formattedDate}.json`;

        // Create and download the backup file
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log("Backup completed successfully!");
    } catch (error) {
        await alertPrompt((translations[currentLanguage]?.failedbackup || translations["en"].failedbackup) + error.message);
    }
}

// Validate and restore data from a backup file
async function validateAndRestoreData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const backup = JSON.parse(e.target.result);

            // Validate the structure of the JSON file
            if (!isValidBackupFile(backup)) {
                await alertPrompt(translations[currentLanguage]?.invalidBackup || translations["en"].invalidBackup);
                return;
            }

            await restoreData(backup);

            await alertPrompt(translations[currentLanguage]?.restorecompleted || translations["en"].restorecompleted);
            location.reload();
        } catch (error) {
            await alertPrompt(translations[currentLanguage]?.restorefailed || translations["en"].restorefailed + error.message);
        }
    };
    reader.readAsText(file);
}

function isValidBackupFile(backup) {
    // Check if localStorage and indexedDB exist and are objects
    return !(typeof backup.localStorage !== "object" || typeof backup.indexedDB !== "object");
}

// Backup IndexedDB: Extract data from ImageDB -> backgroundImages
async function backupIndexedDB() {
    const db = await openDatabase();
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
            keys.forEach(key => {
                store.get(key).onsuccess = (getEvent) => {
                    const value = getEvent.target.result;
                    if (value instanceof Blob) {
                        // Convert Blob to Base64 for JSON compatibility
                        const reader = new FileReader();
                        reader.onload = () => {
                            data[key] = { blob: reader.result, isBlob: true };
                            if (--pending === 0) resolve(data);
                        };
                        reader.readAsDataURL(value);
                    } else {
                        data[key] = value;
                        if (--pending === 0) resolve(data);
                    }
                };
            });
        };

        transaction.onerror = () => reject(transaction.error);
    });
}

// Restore IndexedDB: Clear and repopulate ImageDB -> backgroundImages
async function restoreIndexedDB(data) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);

        store.clear();
        const entries = Object.entries(data);
        let pending = entries.length;

        if (pending === 0) {
            resolve(); // If no data to restore, resolve immediately
            return;
        }

        entries.forEach(([key, value]) => {
            if (value.isBlob) {
                // Convert Base64 back to Blob
                const blob = base64ToBlob(value.blob);
                store.put(blob, key);
            } else {
                store.put(value, key);
            }

            if (--pending === 0) resolve();
        });

        transaction.onerror = () => reject(transaction.error);
    });
}

// Restore data for Storage API, localStorage and IndexedDB.
// Supports both the old (localStorage-only) and new (chromeStorage) backup formats.
async function restoreData(backup) {
    // Clear all synced settings from chrome.storage
    await Storage.clearForRestore();

    // Clear local-only localStorage data (quotes, weather cache)
    // We'll selectively restore only what's in the backup
    const localOnlyKeys = Object.keys(localStorage);
    localOnlyKeys.forEach(key => localStorage.removeItem(key));

    // --- Restore local-only keys (quotes, weather cache, etc.) ---
    if (backup.localStorage) {
        Object.keys(backup.localStorage).forEach(key => {
            // Restore only keys that belong in localStorage
            // (local-only keys: quotes_*, LoadingScreenColor, weatherParsed*)
            if (
                key.startsWith("quotes_") ||
                key === "LoadingScreenColor" ||
                key === "weatherParsedData" ||
                key === "weatherParsedTime" ||
                key === "weatherParsedLocation" ||
                key === "weatherParsedLang"
            ) {
                localStorage.setItem(key, backup.localStorage[key]);
            }
        });
    }

    // --- Restore synced settings ---
    if (backup.chromeStorage && Object.keys(backup.chromeStorage).length > 0) {
        // New backup format: restore from chromeStorage field
        await Storage.setAll(backup.chromeStorage);
    } else if (backup.localStorage) {
        // Old backup format: migrate non-local-only keys to chrome.storage
        const settingsToRestore = {};
        Object.keys(backup.localStorage).forEach(key => {
            if (
                !key.startsWith("quotes_") &&
                key !== "LoadingScreenColor" &&
                key !== "weatherParsedData" &&
                key !== "weatherParsedTime" &&
                key !== "weatherParsedLocation" &&
                key !== "weatherParsedLang"
            ) {
                settingsToRestore[key] = backup.localStorage[key];
            }
        });
        if (Object.keys(settingsToRestore).length > 0) {
            await Storage.setAll(settingsToRestore);
        }
    }

    // Restore IndexedDB from backup
    if (backup.indexedDB) {
        await restoreIndexedDB(backup.indexedDB);
    }
}

// Helper: Convert Base64 string to Blob
function base64ToBlob(base64) {
    const [metadata, data] = base64.split(",");
    const mime = metadata.match(/:(.*?);/)[1];
    const binary = atob(data);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
    }
    return new Blob([array], { type: mime });
}

// ------------------- Reset Settings ----------------------------
const resetbtn = document.getElementById("resetsettings");

// Clear all settings and reload the page
resetbtn.addEventListener("click", async () => {
    const confirmationMessage = translations[currentLanguage]?.confirmRestore || translations["en"].confirmRestore;

    if (await confirmPrompt(confirmationMessage)) {
        await Storage.reset();
        // Also clear local-only localStorage data
        const localKeys = Object.keys(localStorage).filter(k =>
            !k.startsWith("quotes_") && k !== "LoadingScreenColor" &&
            k !== "weatherParsedData" && k !== "weatherParsedTime" &&
            k !== "weatherParsedLocation" && k !== "weatherParsedLang"
        );
        localKeys.forEach(k => localStorage.removeItem(k));
        location.reload();
    }
});
