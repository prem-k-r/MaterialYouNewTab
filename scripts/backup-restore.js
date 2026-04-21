/*
 * Material You NewTab
 * Copyright (c) 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

const LOCAL_BACKUP_FILE_PREFIX = "MYNT_Backup";
const LOCAL_BACKUP_FOLDER = "MYNT_Backups";
const AUTO_BACKUP_MIN_INTERVAL_HOURS = 1;
const CLOUD_BACKUP_FOLDER = "MYNT";

const STORAGE_KEYS = {
    cloudAutoEnabled: "cloudAutoBackupEnabled",
    cloudIntervalHours: "cloudAutoBackupIntervalHours",
    cloudLastAutoBackupAt: "cloudLastAutoBackupAt",
    webdavUrl: "webdavUrl",
    webdavUsername: "webdavUsername",
    webdavPassword: "webdavPassword"
};

const storageFallbackTexts = {
    backupModuleTitle: "Cloud Backup",
    webdavTitle: "WebDAV Sync",
    webdavBackupText: "Backup to WebDAV",
    webdavRestoreText: "Restore Latest",
    webdavUrlPlaceholder: "https://example.com/remote.php/dav/files/username/backups",
    webdavUsernamePlaceholder: "Username (optional)",
    webdavPasswordPlaceholder: "Password or app password (optional)",
    webdavMissingConfig: "Please fill in the WebDAV folder URL first.",
    webdavPermissionDenied: "Host permission was not granted for this WebDAV server.",
    webdavBackupCompleted: "Backup uploaded to WebDAV successfully!",
    webdavDownloadFailed: "Failed to download backup from WebDAV: ",
    webdavUploadFailed: "Failed to upload backup to WebDAV: ",
    webdavRestoreConfirm: "Restore settings from the latest WebDAV backup? Your current local data will be overwritten.",
    webdavLatestPointerMissing: "No latest backup record was found in the MYNT folder.",
    cloudAutoBackupText: "Enable automatic backup",
    cloudAutoBackupHint: "Back up settings to WebDAV on a schedule",
    cloudIntervalPlaceholder: "Hours",
    cloudIntervalHours: "Hours",
    cloudAutoBackupInvalidInterval: "Automatic backup interval must be at least 1 hour.",
    saveBackupConfig: "Save Backup Config",
    backupConfigSaved: "Backup configuration saved."
};

let autoBackupTimerId = null;

const backupButton = document.getElementById("backupBtn");
const restoreButton = document.getElementById("restoreBtn");
const fileInput = document.getElementById("fileInput");
const webdavBackupButton = document.getElementById("webdavBackupBtn");
const webdavRestoreButton = document.getElementById("webdavRestoreBtn");
const webdavUrlInput = document.getElementById("webdavUrlInput");
const webdavUsernameInput = document.getElementById("webdavUsernameInput");
const webdavPasswordInput = document.getElementById("webdavPasswordInput");
const cloudAutoBackupCheckbox = document.getElementById("cloudAutoBackupCheckbox");
const cloudIntervalInput = document.getElementById("cloudIntervalInput");
const saveBackupConfigBtn = document.getElementById("saveBackupConfigBtn");
const resetbtn = document.getElementById("resetsettings");

applyStorageTexts();
loadWebDAVSettings();
setupEventListeners();
setupAutoBackupScheduler();

function setupEventListeners() {
    backupButton.addEventListener("click", backupData);
    restoreButton.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", validateAndRestoreData);

    webdavBackupButton.addEventListener("click", () => uploadSnapshotToWebDAV({
        isAutomatic: false,
        requestPermissionInteractively: true
    }));
    webdavRestoreButton.addEventListener("click", restoreFromWebDAV);
    saveBackupConfigBtn.addEventListener("click", saveBackupConfig);

    resetbtn.addEventListener("click", async () => {
        const confirmationMessage = translations[currentLanguage]?.confirmRestore || translations.en.confirmRestore;
        if (await confirmPrompt(confirmationMessage)) {
            await snapshotService.clearAllStoredData();
            location.reload();
        }
    });
}

async function backupData() {
    try {
        const backup = await snapshotService.createSnapshot();
        await downloadBackupFile(backup, buildLocalBackupFileName());
    } catch (error) {
        await alertPrompt(t("failedbackup") + getErrorMessage(error));
    }
}

async function validateAndRestoreData(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    try {
        const backup = JSON.parse(await file.text());
        await restoreSnapshotAndReload(backup);
    } catch (error) {
        await alertPrompt(t("restorefailed") + getErrorMessage(error));
    } finally {
        fileInput.value = "";
    }
}

async function uploadSnapshotToWebDAV(options = {}) {
    const isAutomatic = options.isAutomatic === true;
    const requestPermissionInteractively = options.requestPermissionInteractively === true;

    try {
        const config = getWebDAVConfig();
        if (!config) {
            if (!isAutomatic) {
                await alertPrompt(t("webdavMissingConfig"));
            }
            return false;
        }

        const hasPermission = await ensureHostPermission(config.requestOrigin, {
            interactive: requestPermissionInteractively
        });
        if (!hasPermission) {
            if (!isAutomatic) {
                await alertPrompt(t("webdavPermissionDenied"));
            }
            return false;
        }

        const snapshot = await snapshotService.createSnapshot();
        const fileName = buildRemoteBackupFileName();
        const headers = buildWebDAVHeaders(config);
        const folderUrl = buildProviderFolderUrl(config.baseUrl, CLOUD_BACKUP_FOLDER);

        await ensureWebDAVFolder(folderUrl, headers);
        await putJson(buildRemoteFileUrl(folderUrl, fileName), snapshot, headers);
        await putJson(buildRemoteFileUrl(folderUrl, buildLatestPointerFileName()), {
            latestFileName: fileName,
            backedUpAt: new Date().toISOString()
        }, headers);

        if (isAutomatic) {
            localStorage.setItem(STORAGE_KEYS.cloudLastAutoBackupAt, String(Date.now()));
        } else {
            await alertPrompt(t("webdavBackupCompleted"));
        }

        return true;
    } catch (error) {
        if (isAutomatic) {
            console.error("Automatic WebDAV backup failed:", error);
        } else {
            await alertPrompt(t("webdavUploadFailed") + getErrorMessage(error));
        }
        return false;
    }
}

async function restoreFromWebDAV() {
    try {
        const config = getWebDAVConfig();
        if (!config) {
            await alertPrompt(t("webdavMissingConfig"));
            return;
        }

        const hasPermission = await ensureHostPermission(config.requestOrigin, {
            interactive: true
        });
        if (!hasPermission) {
            await alertPrompt(t("webdavPermissionDenied"));
            return;
        }

        if (!(await confirmPrompt(t("webdavRestoreConfirm")))) {
            return;
        }

        const headers = buildWebDAVHeaders(config);
        const folderUrl = buildProviderFolderUrl(config.baseUrl, CLOUD_BACKUP_FOLDER);
        const latestResponse = await fetch(buildRemoteFileUrl(folderUrl, buildLatestPointerFileName()), {
            method: "GET",
            headers
        });

        if (latestResponse.status === 404) {
            await alertPrompt(t("webdavLatestPointerMissing"));
            return;
        }

        if (!latestResponse.ok) {
            throw new Error(`${latestResponse.status} ${latestResponse.statusText}`);
        }

        const latestPointer = await latestResponse.json();
        const backupResponse = await fetch(buildRemoteFileUrl(folderUrl, latestPointer.latestFileName), {
            method: "GET",
            headers
        });

        if (!backupResponse.ok) {
            throw new Error(`${backupResponse.status} ${backupResponse.statusText}`);
        }

        await restoreSnapshotAndReload(await backupResponse.json());
    } catch (error) {
        await alertPrompt(t("webdavDownloadFailed") + getErrorMessage(error));
    }
}

function applyStorageTexts() {
    document.getElementById("cloudBackupSectionTitle").textContent = t("backupModuleTitle");
    document.getElementById("webdavTitle").textContent = t("webdavTitle");
    document.getElementById("webdavBackupText").textContent = t("webdavBackupText");
    document.getElementById("webdavRestoreText").textContent = t("webdavRestoreText");
    document.getElementById("cloudAutoBackupText").textContent = t("cloudAutoBackupText");
    document.getElementById("cloudAutoBackupHint").textContent = t("cloudAutoBackupHint");
    document.getElementById("cloudIntervalUnitLabel").textContent = t("cloudIntervalHours");
    saveBackupConfigBtn.textContent = t("saveBackupConfig");
    webdavUrlInput.placeholder = t("webdavUrlPlaceholder");
    webdavUsernameInput.placeholder = t("webdavUsernamePlaceholder");
    webdavPasswordInput.placeholder = t("webdavPasswordPlaceholder");
    cloudIntervalInput.placeholder = t("cloudIntervalPlaceholder");
}

function loadWebDAVSettings() {
    webdavUrlInput.value = localStorage.getItem(STORAGE_KEYS.webdavUrl) || "";
    webdavUsernameInput.value = localStorage.getItem(STORAGE_KEYS.webdavUsername) || "";
    webdavPasswordInput.value = localStorage.getItem(STORAGE_KEYS.webdavPassword) || "";
    cloudAutoBackupCheckbox.checked = (localStorage.getItem(STORAGE_KEYS.cloudAutoEnabled)
        ?? localStorage.getItem("webdavAutoBackupEnabled")) === "true";
    cloudIntervalInput.value = localStorage.getItem(STORAGE_KEYS.cloudIntervalHours)
        || localStorage.getItem("webdavAutoBackupIntervalHours")
        || "24";
}

async function saveBackupConfig() {
    const config = getWebDAVConfig();
    if (!config) {
        await alertPrompt(t("webdavMissingConfig"));
        return;
    }

    const intervalHours = getAutoBackupIntervalHours();
    if (intervalHours < AUTO_BACKUP_MIN_INTERVAL_HOURS) {
        await alertPrompt(t("cloudAutoBackupInvalidInterval"));
        cloudIntervalInput.value = "1";
        return;
    }

    localStorage.setItem(STORAGE_KEYS.webdavUrl, config.baseUrl);
    localStorage.setItem(STORAGE_KEYS.webdavUsername, webdavUsernameInput.value);
    localStorage.setItem(STORAGE_KEYS.webdavPassword, webdavPasswordInput.value);
    localStorage.setItem(STORAGE_KEYS.cloudAutoEnabled, String(cloudAutoBackupCheckbox.checked));
    localStorage.setItem(STORAGE_KEYS.cloudIntervalHours, String(intervalHours));

    setupAutoBackupScheduler();
    await alertPrompt(t("backupConfigSaved"));
}

function getWebDAVConfig() {
    const baseUrl = webdavUrlInput.value.trim().replace(/\/+$/, "");
    if (!baseUrl) {
        return null;
    }

    return {
        baseUrl,
        username: webdavUsernameInput.value,
        password: webdavPasswordInput.value,
        requestOrigin: new URL(baseUrl).origin + "/*"
    };
}

function setupAutoBackupScheduler() {
    if (autoBackupTimerId) {
        clearInterval(autoBackupTimerId);
        autoBackupTimerId = null;
    }

    if (localStorage.getItem(STORAGE_KEYS.cloudAutoEnabled) !== "true") {
        return;
    }

    const intervalHours = Number(localStorage.getItem(STORAGE_KEYS.cloudIntervalHours) || "24");
    if (intervalHours < AUTO_BACKUP_MIN_INTERVAL_HOURS) {
        return;
    }

    maybeRunAutomaticBackup(intervalHours);
    autoBackupTimerId = setInterval(() => {
        maybeRunAutomaticBackup(intervalHours);
    }, intervalHours * 60 * 60 * 1000);
}

async function maybeRunAutomaticBackup(intervalHours) {
    const lastAutoBackupAt = Number(localStorage.getItem(STORAGE_KEYS.cloudLastAutoBackupAt) || "0");
    const intervalMs = intervalHours * 60 * 60 * 1000;

    if (Date.now() - lastAutoBackupAt < intervalMs) {
        return;
    }

    const success = await uploadSnapshotToWebDAV({
        isAutomatic: true,
        requestPermissionInteractively: false
    });
    if (success) {
        localStorage.setItem(STORAGE_KEYS.cloudLastAutoBackupAt, String(Date.now()));
    }
}

function getAutoBackupIntervalHours() {
    const parsedValue = parseInt(cloudIntervalInput.value, 10);
    return Number.isNaN(parsedValue) ? 24 : parsedValue;
}

function buildWebDAVHeaders(config) {
    const headers = { "Content-Type": "application/json" };
    if (config.username || config.password) {
        headers.Authorization = `Basic ${encodeBasicAuth(config.username, config.password)}`;
    }
    return headers;
}

async function ensureHostPermission(originPattern, options = {}) {
    const interactive = options.interactive === true;
    const chromePermissions = typeof chrome !== "undefined" ? chrome.permissions : null;
    const browserPermissions = typeof browser !== "undefined" ? browser.permissions : null;
    const permissionsApi = chromePermissions || browserPermissions;

    if (!permissionsApi || typeof permissionsApi.contains !== "function" || typeof permissionsApi.request !== "function") {
        return true;
    }

    const permissionRequest = { origins: [originPattern] };
    if (interactive) {
        return chromePermissions
            ? callChromePermissionApi("request", permissionRequest)
            : permissionsApi.request(permissionRequest);
    }

    return chromePermissions
        ? callChromePermissionApi("contains", permissionRequest)
        : permissionsApi.contains(permissionRequest);
}

async function putJson(url, payload, headers) {
    const response = await fetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload, null, 2)
    });

    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
    }
}

async function ensureWebDAVFolder(folderUrl, headers) {
    const response = await fetch(folderUrl, {
        method: "MKCOL",
        headers
    });

    if (response.ok || response.status === 405 || response.status === 301 || response.status === 302) {
        return;
    }

    throw new Error(`Failed to prepare backup folder: ${response.status} ${response.statusText}`);
}

function buildProviderFolderUrl(baseUrl, folderName) {
    const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
    const parsedUrl = new URL(normalizedBaseUrl);
    const pathSegments = parsedUrl.pathname.split("/").filter(Boolean).map((segment) => {
        try {
            return decodeURIComponent(segment).toLowerCase();
        } catch {
            return segment.toLowerCase();
        }
    });

    if (pathSegments[pathSegments.length - 1] === folderName.toLowerCase()) {
        return normalizedBaseUrl;
    }

    return `${normalizedBaseUrl}/${folderName}`;
}

function buildRemoteFileUrl(baseUrl, fileName) {
    return `${baseUrl}/${encodeURIComponent(fileName)}`;
}

function buildLocalBackupFileName() {
    return `${LOCAL_BACKUP_FOLDER}/${LOCAL_BACKUP_FILE_PREFIX}_${buildTimestampPart()}.json`;
}

function buildRemoteBackupFileName() {
    return `${LOCAL_BACKUP_FILE_PREFIX}_${buildTimestampPart()}.json`;
}

function buildLatestPointerFileName() {
    return `${LOCAL_BACKUP_FILE_PREFIX}_latest.json`;
}

function buildTimestampPart() {
    const date = new Date();
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("") + "_" + [
        String(date.getHours()).padStart(2, "0"),
        String(date.getMinutes()).padStart(2, "0"),
        String(date.getSeconds()).padStart(2, "0")
    ].join("");
}

async function downloadBackupFile(backup, fileName) {
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const objectUrl = URL.createObjectURL(blob);

    try {
        const browserDownloads = typeof browser !== "undefined" ? browser.downloads : null;
        if (browserDownloads?.download) {
            await browserDownloads.download({ url: objectUrl, filename: fileName, saveAs: false, conflictAction: "uniquify" });
            return;
        }

        const chromeDownloads = typeof chrome !== "undefined" ? chrome.downloads : null;
        if (chromeDownloads?.download) {
            await new Promise((resolve, reject) => {
                chromeDownloads.download({ url: objectUrl, filename: fileName, saveAs: false, conflictAction: "uniquify" }, (downloadId) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                        return;
                    }

                    resolve(downloadId);
                });
            });
            return;
        }

        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = fileName.split("/").pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

async function restoreSnapshotAndReload(snapshot) {
    const normalizedSnapshot = snapshotService.normalizeSnapshot(snapshot);
    if (!snapshotService.validateSnapshot(normalizedSnapshot)) {
        await alertPrompt(t("invalidBackup"));
        return;
    }

    await snapshotService.restoreSnapshot(normalizedSnapshot);
    await alertPrompt(t("restorecompleted"));
    location.reload();
}

function t(key) {
    return translations[currentLanguage]?.[key]
        || translations.en?.[key]
        || storageFallbackTexts[key]
        || key;
}

function encodeBasicAuth(username, password) {
    const credentials = `${username}:${password}`;
    const bytes = new TextEncoder().encode(credentials);
    let binary = "";
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary);
}

function callChromePermissionApi(method, permissionRequest) {
    return new Promise((resolve, reject) => {
        chrome.permissions[method](permissionRequest, (result) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
            }
            resolve(result);
        });
    });
}

function getErrorMessage(error) {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return String(error);
}
