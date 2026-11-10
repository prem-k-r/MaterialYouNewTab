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
let pendingSavePromise = null;

// To set background image using a Blob
function setBackground(blob, bgType) {
    const previousUrl = currentBgUrl;
    const newUrl = URL.createObjectURL(blob);
    currentBgUrl = newUrl;
    document.body.style.setProperty("--bg-image", `url(${newUrl})`);
    if (bgType) {
        updateBackgroundType(bgType);
    }
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
async function saveImageToIndexedDB(imageBlob, isRandom, infoData = null) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);

        store.put(imageBlob, "backgroundImage");
        store.put(new Date().toISOString(), timestampKey);
        store.put(isRandom ? "random" : "upload", imageTypeKey);
        if (infoData) {
            store.put(infoData, "imageInfo");
        } else {
            store.delete("imageInfo");
        }

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
        getFromStore(db, imageTypeKey),
        getFromStore(db, "imageInfo")
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
        store.delete("imageInfo");

        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject("Delete error: " + event.target.errorCode);
    });
}

// Handle file input and save image as upload
document.getElementById("imageUpload").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        const blob = file.slice(0, file.size, file.type);
        setBackground(blob, "upload");
        updateWallpaperSourceUI(null);

        // Turn off daily random wallpaper toggle when custom wallpaper is uploaded
        const randomToggle = document.getElementById("randomWallpaperToggle");
        if (randomToggle && randomToggle.checked) {
            randomToggle.checked = false;
            localStorage.setItem("autoDailyWallpaper", "false");
        }

        pendingSavePromise = saveImageToIndexedDB(blob, false)
            .catch(error => console.error("Error saving image:", error))
            .finally(() => { pendingSavePromise = null; });
    }
    event.target.value = "";
});

// Helper to get wallpaper fetch configuration based on quality and source
function getRandomImageFetchConfig() {
    const quality = localStorage.getItem("wallpaperQuality") || "1080p";
    const source = localStorage.getItem("wallpaperSource") || "picsum";

    const dimensions = {
        "720p": { width: 1280, height: 720, bingRes: "1366" },
        "1080p": { width: 1920, height: 1080, bingRes: "1920" },
        "original": { width: 3840, height: 2160, bingRes: "3840" }
    }[quality] || { width: 1920, height: 1080, bingRes: "1920" };

    if (source === "bing") {
        return {
            url: `https://bing.biturl.top/?resolution=${dimensions.bingRes}&format=image`,
            source: "bing"
        };
    } else {
        return {
            url: `https://picsum.photos/${dimensions.width}/${dimensions.height}`,
            source: source
        };
    }
}

// Fetch and apply random image as background
async function applyRandomImage(showConfirmation = true) {
    if (showConfirmation && !(await confirmPrompt(
        translations[currentLanguage]?.confirmWallpaper || translations["en"].confirmWallpaper
    ))) {
        return;
    }
    try {
        const config = getRandomImageFetchConfig();
        const response = await fetch(config.url);
        const blob = await response.blob();

        let infoData = null;
        if (config.source === "bing") {
            infoData = {
                author: "Bing Daily Wallpaper",
                url: "https://www.bing.com",
                isBing: true
            };
        } else {
            try {
                const redirectedUrl = response.url;
                const match = redirectedUrl.match(/\/id\/(\d+)\//);
                if (match) {
                    const photoId = match[1];
                    const infoResponse = await fetch(`https://picsum.photos/id/${photoId}/info`);
                    infoData = await infoResponse.json();
                }
            } catch (infoError) {
                console.error("Error fetching wallpaper metadata:", infoError);
            }
        }

        await saveImageToIndexedDB(blob, true, infoData);
        setBackground(blob, "random");
        updateWallpaperSourceUI(infoData);
    } catch (error) {
        console.error("Error fetching random image:", error);
    }
}

// Function to update the background type attributes
function updateBackgroundType(bgType) {
    const isRandom = bgType === "random";
    const hasWallpaper = bgType !== "color";

    document.body.setAttribute("data-bg", hasWallpaper ? "wallpaper" : "color");
    document.body.setAttribute("data-bg-type", bgType);
    
    const downloadBtn = document.getElementById("downloadWallpaper");
    if (downloadBtn) {
        downloadBtn.classList.toggle("hidden", !isRandom);
        if (!isRandom) {
            downloadBtn.setAttribute("tabindex", "-1");
            downloadBtn.setAttribute("aria-hidden", "true");
        } else {
            downloadBtn.removeAttribute("tabindex");
            downloadBtn.removeAttribute("aria-hidden");
        }
    }

    const clearBtn = document.getElementById("clearImage");
    if (clearBtn) {
        clearBtn.classList.toggle("hidden", !hasWallpaper);
        if (!hasWallpaper) {
            clearBtn.setAttribute("tabindex", "-1");
            clearBtn.setAttribute("aria-hidden", "true");
        } else {
            clearBtn.removeAttribute("tabindex");
            clearBtn.removeAttribute("aria-hidden");
        }
    }

    const randomToggle = document.getElementById("randomWallpaperToggle");
    if (randomToggle) {
        randomToggle.checked = localStorage.getItem("autoDailyWallpaper") === "true";
    }

    const optionControls = [
        document.getElementById("wallpaperQuality"),
        document.getElementById("wallpaperSourceSelect"),
        document.getElementById("showAttributionCheckbox")
    ];
    optionControls.forEach((ctrl) => {
        if (ctrl) {
            if (!isRandom) {
                ctrl.setAttribute("tabindex", "-1");
                ctrl.setAttribute("aria-hidden", "true");
            } else {
                ctrl.removeAttribute("tabindex");
                ctrl.removeAttribute("aria-hidden");
            }
        }
    });
}

// Helper function to validate Unsplash URLs
function isValidUnsplashUrl(urlStr) {
    try {
        if (!urlStr) return false;
        const parsed = new URL(urlStr);
        return parsed.protocol === "https:" && (parsed.hostname === "unsplash.com" || parsed.hostname.endsWith(".unsplash.com"));
    } catch (e) {
        return false;
    }
}

// Function to show/hide the wallpaper source attribution link
function updateWallpaperSourceUI(infoData) {
    const sourceContainer = document.getElementById("wallpaperSource");
    if (!sourceContainer) return;

    const showAttribution = localStorage.getItem("showWallpaperAttribution") === "true";
    const attributionCheckbox = document.getElementById("showAttributionCheckbox");
    if (attributionCheckbox) {
        attributionCheckbox.checked = showAttribution;
    }

    if (showAttribution && infoData && infoData.author) {
        const prefixElement = document.getElementById("wallpaperSourcePrefix");
        const linkElement = document.getElementById("wallpaperSourceLink");
        const photoByText = translations[currentLanguage]?.photoBy || translations["en"].photoBy || "Photo by";

        prefixElement.textContent = infoData.isBing ? "" : `${photoByText} `;
        linkElement.textContent = infoData.author;
        linkElement.href = infoData.url || "#";
        sourceContainer.style.display = "block";
    } else {
        sourceContainer.style.display = "none";
    }
}

// Check and update image on page load
function checkAndUpdateImage() {
    loadImageAndDetails()
        .then(([blob, savedTimestamp, imageType, infoData]) => {
            const now = new Date();
            const lastUpdate = new Date(savedTimestamp);

            if (!blob || !savedTimestamp || isNaN(lastUpdate)) {
                updateBackgroundType("color");
                updateWallpaperSourceUI(null);
                return;
            }

            if (imageType === "upload") {
                setBackground(blob, "upload");
                updateWallpaperSourceUI(null);
                return;
            }

            const autoDaily = localStorage.getItem("autoDailyWallpaper") === "true";
            if (autoDaily && lastUpdate.toDateString() !== now.toDateString()) {
                applyRandomImage(false);
            } else {
                setBackground(blob, "random");
                updateWallpaperSourceUI(infoData);
            }

        })
        .catch((error) => {
            console.warn("Unable to load image details:", error);
            updateBackgroundType("color");
            updateWallpaperSourceUI(null);
        });
}

// Event listeners for buttons
document.getElementById("uploadTrigger").addEventListener("click", () =>
    document.getElementById("imageUpload").click()
);

document.getElementById("clearImage").addEventListener("click", async function () {
    try {
        if (pendingSavePromise) {
            try {
                await pendingSavePromise;
            } catch (e) {
                console.warn("Pending save error:", e);
            }
        }

        const hasBgSet = currentBgUrl || document.body.getAttribute("data-bg") === "wallpaper";
        const [blob] = await loadImageAndDetails();
        if (!blob && !hasBgSet) {
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
                updateBackgroundType("color");
                updateWallpaperSourceUI(null);
                const fileInput = document.getElementById("imageUpload");
                if (fileInput) fileInput.value = "";

                // Turn off random wallpaper toggle when wallpaper is deleted
                const randomToggle = document.getElementById("randomWallpaperToggle");
                if (randomToggle && randomToggle.checked) {
                    randomToggle.checked = false;
                    localStorage.setItem("autoDailyWallpaper", "false");
                }
            } catch (error) {
                console.error(error);
            }
        }
    } catch (error) {
        console.error(error);
    }
});

document.getElementById("randomImageTrigger").addEventListener("click", applyRandomImage);

// Random Wallpaper Daily Auto-Fetch Toggle switch listener
const randomToggle = document.getElementById("randomWallpaperToggle");
if (randomToggle) {
    randomToggle.checked = localStorage.getItem("autoDailyWallpaper") === "true";
    randomToggle.addEventListener("change", async (e) => {
        const isEnabled = e.target.checked;
        localStorage.setItem("autoDailyWallpaper", isEnabled ? "true" : "false");

        if (isEnabled) {
            const currentBgType = document.body.getAttribute("data-bg-type") || "color";
            // If no wallpaper is set or an upload is set, fetch a random wallpaper immediately.
            // If a random wallpaper is already active, keep it until tomorrow's auto daily update.
            if (currentBgType === "color" || currentBgType === "upload") {
                await applyRandomImage(false);
            }
        }
    });
}

// Attribution Toggle switch listener
const attributionCheckbox = document.getElementById("showAttributionCheckbox");
if (attributionCheckbox) {
    attributionCheckbox.checked = localStorage.getItem("showWallpaperAttribution") === "true";
    attributionCheckbox.addEventListener("change", async (e) => {
        localStorage.setItem("showWallpaperAttribution", e.target.checked ? "true" : "false");
        try {
            const [blob, savedTimestamp, imageType, infoData] = await loadImageAndDetails();
            if (imageType === "random") {
                updateWallpaperSourceUI(infoData);
            }
        } catch (error) {
            console.error("Error updating attribution:", error);
        }
    });
}

// Quality and Source Select persistence
const qualitySelect = document.getElementById("wallpaperQuality");
if (qualitySelect) {
    qualitySelect.value = localStorage.getItem("wallpaperQuality") || "1080p";
    qualitySelect.addEventListener("change", (e) => {
        localStorage.setItem("wallpaperQuality", e.target.value);
    });
}

// Helper to check and request host permissions for Bing (Chrome MV3 optional host permissions)
async function hasBingPermission() {
    const permissionsApi = window.chrome?.permissions || window.browser?.permissions;
    if (!permissionsApi?.contains) return true;
    return new Promise((resolve) => {
        permissionsApi.contains({ origins: ["https://www.bing.com/*"] }, (granted) => {
            resolve(Boolean(granted));
        });
    });
}

async function requestBingPermission() {
    const permissionsApi = window.chrome?.permissions || window.browser?.permissions;
    if (!permissionsApi?.request) return true;
    return new Promise((resolve) => {
        permissionsApi.request({ origins: ["https://www.bing.com/*"] }, (granted) => {
            resolve(Boolean(granted));
        });
    });
}

const sourceSelect = document.getElementById("wallpaperSourceSelect");
if (sourceSelect) {
    sourceSelect.value = localStorage.getItem("wallpaperSource") || "picsum";
    sourceSelect.addEventListener("change", async (e) => {
        const previousSource = localStorage.getItem("wallpaperSource") || "picsum";
        if (e.target.value === "bing") {
            const hasPerm = await hasBingPermission();
            if (!hasPerm) {
                const granted = await requestBingPermission();
                if (!granted) {
                    sourceSelect.value = previousSource;
                    return;
                }
            }
        }
        localStorage.setItem("wallpaperSource", e.target.value);
    });
}

// Function to download the current background image
async function downloadWallpaper() {
    try {
        const [blob, savedTimestamp, imageType, infoData] = await loadImageAndDetails();
        if (!blob || imageType !== "random") {
            return;
        }

        // Get extension based on blob type (default to jpg)
        let extension = "jpg";
        if (blob.type === "image/png") {
            extension = "png";
        } else if (blob.type === "image/webp") {
            extension = "webp";
        } else if (blob.type === "image/gif") {
            extension = "gif";
        }

        // For random wallpaper with valid Unsplash attribution, trigger direct high-res download
        if (infoData && isValidUnsplashUrl(infoData.url)) {
            const unsplashMatch = infoData.url.match(/photos\/([a-zA-Z0-9_-]+)/);
            if (unsplashMatch) {
                const photoId = unsplashMatch[1];
                const unsplashDownloadUrl = `https://unsplash.com/photos/${photoId}/download?force=true`;

                // Trigger direct download from Unsplash (bypasses Picsum compression)
                const a = document.createElement("a");
                a.href = unsplashDownloadUrl;
                a.target = "_blank";
                a.rel = "noopener noreferrer";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                return;
            }
        }

        // Fallback: date-based filename for blobs without Unsplash metadata
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const fileName = `wallpaper-${year}-${month}-${day}.${extension}`;

        // Create temporary link and trigger download for custom local uploads
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error downloading wallpaper:", error);
    }
}

document.getElementById("downloadWallpaper").addEventListener("click", downloadWallpaper);

// Start image check on page load
checkAndUpdateImage();
