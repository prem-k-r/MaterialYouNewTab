/*
 * Material You New Tab
 * Copyright (c) 2024-2026 Prem, 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */


// -------------------------- Wallpaper -----------------------------
const dbName = "ImageDB";
const storeName = "backgroundImages";
const timestampKey = "lastUpdateTime"; // Key to store last update time
const imageTypeKey = "imageType"; // Key to store the type of image ("random" or "upload")

let currentBgUrl = null;

// To set background image using a Blob
function setBackground(blob) {
    const previousUrl = currentBgUrl;
    const newUrl = URL.createObjectURL(blob);
    currentBgUrl = newUrl;
    document.body.style.setProperty("--bg-image", `url(${newUrl})`);
    toggleBackgroundType(true);
    if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
    }
}

// Open IndexedDB database
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            db.createObjectStore(storeName);
        };
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject("Database error: " + event.target.errorCode);
    });
}

// Save image Blob, timestamp, and type to IndexedDB
async function saveImageToIndexedDB(imageBlob, isRandom) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);

        store.put(imageBlob, "backgroundImage");
        store.put(new Date().toISOString(), timestampKey);
        store.put(isRandom ? "random" : "upload", imageTypeKey);

        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject("Transaction error: " + event.target.errorCode);
    });
}

// Load image Blob, timestamp, and type from IndexedDB
async function loadImageAndDetails() {
    const db = await openDatabase();
    return Promise.all([
        getFromStore(db, "backgroundImage"),
        getFromStore(db, timestampKey),
        getFromStore(db, imageTypeKey)
    ]);
}

function getFromStore(db, key) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.get(key);

        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject("Request error: " + event.target.errorCode);
    });
}

// Clear image data from IndexedDB
async function clearImageFromIndexedDB() {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        store.delete("backgroundImage");
        store.delete(timestampKey);
        store.delete(imageTypeKey);

        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject("Delete error: " + event.target.errorCode);
    });
}

// Handle file input and save image as upload
document.getElementById("imageUpload").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        saveImageToIndexedDB(file, false)
            .then(() => setBackground(file))
            .catch(error => console.error(error));
    }
});

// Fetch and apply random image as background
const RANDOM_IMAGE_URL = "https://picsum.photos/1920/1080";

async function applyRandomImage(showConfirmation = true) {
    if (showConfirmation && !(await confirmPrompt(
        translations[currentLanguage]?.confirmWallpaper || translations["en"].confirmWallpaper
    ))) {
        return;
    }
    try {
        const response = await fetch(RANDOM_IMAGE_URL);
        const blob = await response.blob();
        await saveImageToIndexedDB(blob, true);
        setBackground(blob);
    } catch (error) {
        console.error("Error fetching random image:", error);
    }
}

// Function to update the background type attribute
function toggleBackgroundType(hasWallpaper) {
    document.body.setAttribute("data-bg", hasWallpaper ? "wallpaper" : "color");
}

// Check and update image on page load
function checkAndUpdateImage() {
    loadImageAndDetails()
        .then(([blob, savedTimestamp, imageType]) => {
            const now = new Date();
            const lastUpdate = new Date(savedTimestamp);

            if (!blob || !savedTimestamp || isNaN(lastUpdate)) {
                toggleBackgroundType(false);
                return;
            }

            if (imageType === "upload") {
                setBackground(blob);
                return;
            }

            if (lastUpdate.toDateString() !== now.toDateString()) {
                applyRandomImage(false);
            } else {
                setBackground(blob);
            }

        })
        .catch((error) => {
            console.error("Error loading image details:", error);
            toggleBackgroundType(false);
        });
}

// Event listeners for buttons
document.getElementById("uploadTrigger").addEventListener("click", () =>
    document.getElementById("imageUpload").click()
);

document.getElementById("clearImage").addEventListener("click", async function () {
    try {
        const [blob] = await loadImageAndDetails();
        if (!blob) {
            await alertPrompt(translations[currentLanguage]?.Nobackgroundset || translations["en"].Nobackgroundset);
            return;
        }

        const confirmationMessage = translations[currentLanguage]?.clearbackgroundimage || translations["en"].clearbackgroundimage;
        if (await confirmPrompt(confirmationMessage)) {
            try {
                await clearImageFromIndexedDB();
                if (currentBgUrl) {
                    URL.revokeObjectURL(currentBgUrl);
                    currentBgUrl = null;
                }
                document.body.style.removeProperty("--bg-image");
                toggleBackgroundType(false);
            } catch (error) {
                console.error(error);
            }
        }
    } catch (error) {
        console.error(error);
    }
});

document.getElementById("randomImageTrigger").addEventListener("click", applyRandomImage);

// Start image check on page load
checkAndUpdateImage();
