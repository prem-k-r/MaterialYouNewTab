/*
 * Material You New Tab
 * Copyright (c) 2024-2026 Prem, 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

//  -----------Search by Image------------
const imageSearchIcon = document.getElementById("imageSearchIcon");
const imageSearchIconCheckbox = document.getElementById("imageSearchIconCheckbox");

// Search by image is implemented exclusively against Google Lens. Bing was
// tried but its Visual Search page rejects programmatically-injected files;
// other engines (DuckDuckGo, Brave, YouTube, Reddit, Wikipedia, Quora) have
// no reverse-image-search service at all. So a single endpoint is used,
// regardless of the active search engine. A small notice is shown in the
// popover when the active engine isn't Google so users aren't surprised.
const googleLensByUrl = (url) => `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(url)}`;
// lens.google.com/ redirects to www.google.com/?olud — go straight there so
// the content script's match patterns can be narrower.
const googleLensUpload = "https://www.google.com/?olud";

const LENS_ENGINE_VALUE = "engine6";
const googleEngineValues = new Set(["engine1", LENS_ENGINE_VALUE]);

function isGoogleEngineActive() {
    const selected = document.querySelector('input[name="search-engine"]:checked');
    return selected ? googleEngineValues.has(selected.value) : false;
}

function isLensActiveEngine() {
    const selected = document.querySelector('input[name="search-engine"]:checked');
    return selected?.value === LENS_ENGINE_VALUE;
}

// Google Lens supports: .jpg/.jpeg, .png, .bmp, .tif/.tiff, .webp
const DATA_URL_IMAGE_RE = /^data:image\/(jpe?g|png|bmp|tiff?|webp);base64,/i;
function isDataUrlImage(value) {
    return DATA_URL_IMAGE_RE.test(value);
}

function openImageSearchByUrl(url) {
    // Always called from a fresh user gesture (URL submit click, paste,
    // form submit). Use window.open directly so the user activation
    // doesn't expire while waiting on an async tabs.create probe.
    window.open(googleLensByUrl(url), "_blank", "noopener");
}

function openImageSearchUpload() {
    // Generic fallback — prefer tabs.create when available, fall back to
    // window.open. Used from paths where the originating gesture may
    // already have been consumed by an earlier dialog or async hop.
    openPreparedImageSearchUrl(googleLensUpload);
}

function getExtensionApi() {
    try {
        return (typeof browser !== "undefined" ? browser : chrome);
    } catch {
        return null;
    }
}

function openUrlFallback(url) {
    const opened = window.open(url, "_blank", "noopener");
    if (!opened) window.location.href = url;
}

function createExtensionTab(url) {
    const api = getExtensionApi();
    if (!api?.tabs?.create) return Promise.resolve(false);

    return new Promise((resolve) => {
        let settled = false;
        const finish = () => {
            if (settled) return;
            settled = true;
            resolve(!getRuntimeLastError());
        };

        try {
            const result = api.tabs.create({ url }, finish);
            if (result && typeof result.then === "function") {
                result.then(() => resolve(true), () => resolve(false));
            }
        } catch {
            resolve(false);
        }
    });
}

async function openPreparedImageSearchUrl(url) {
    if (await createExtensionTab(url)) return;
    openUrlFallback(url);
}

// Hand off a Blob/File to the engine's upload page via storage + URL hash.
// The matching content script (scripts/image-search-injector.js) reads the
// payload and injects it into the page's file input. If anything in this
// chain fails (no storage permission, content script blocked, page DOM
// changed) the page still opens — the user can drop the file manually.
function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
}

function getStorage() {
    try {
        const api = getExtensionApi();
        return api?.storage?.local || null;
    } catch {
        return null;
    }
}

function getRuntimeLastError() {
    try {
        const api = getExtensionApi();
        return api?.runtime?.lastError || null;
    } catch {
        return null;
    }
}

function storageSet(storage, value) {
    return new Promise((resolve, reject) => {
        let settled = false;
        const finish = () => {
            if (settled) return;
            settled = true;
            const err = getRuntimeLastError();
            if (err) reject(err); else resolve();
        };
        try {
            const result = storage.set(value, finish);
            if (result && typeof result.then === "function") {
                result.then(resolve, reject);
            }
        } catch (err) {
            reject(err);
        }
    });
}

async function openImageSearchWithBlob(blob, name) {
    const storage = getStorage();
    if (!storage) {
        await openPreparedImageSearchUrl(googleLensUpload);
        return;
    }
    try {
        const dataUrl = await blobToDataUrl(blob);
        const key = `mynt-img-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        await storageSet(storage, { [key]: { dataUrl, name: name || "image", type: blob.type } });
        const url = `${googleLensUpload}#mynt-image-search=${encodeURIComponent(key)}`;
        await openPreparedImageSearchUrl(url);
    } catch {
        await openPreparedImageSearchUrl(googleLensUpload);
    }
}

// Visibility toggle (mirrors the mic icon pattern)
const savedImageSearchVisible = localStorage.getItem("imageSearchIconVisible");
let isImageSearchIconVisible = savedImageSearchVisible === null ? true : savedImageSearchVisible === "true";

if (savedImageSearchVisible === null) {
    localStorage.setItem("imageSearchIconVisible", isImageSearchIconVisible);
}

imageSearchIconCheckbox.checked = !isImageSearchIconVisible;
imageSearchIcon.style.display = isImageSearchIconVisible ? "flex" : "none";

imageSearchIconCheckbox.addEventListener("change", () => {
    const visible = !imageSearchIconCheckbox.checked;
    imageSearchIcon.style.display = visible ? "flex" : "none";
    localStorage.setItem("imageSearchIconVisible", visible);
});

// Popover with URL input and file picker
const popover = document.createElement("div");
popover.className = "imageSearchPopover bgLightTint";
popover.id = "imageSearchPopover";
popover.style.display = "none";
popover.innerHTML = `
    <div class="imageSearchHeader" id="imageSearchHeader">Search by image</div>
    <div class="imageSearchNotice" id="imageSearchNotice" hidden>
        <svg viewBox="0 -960 960 960" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M480-280q17 0 28.5-11.5T520-320v-160q0-17-11.5-28.5T480-520q-17 0-28.5 11.5T440-480v160q0 17 11.5 28.5T480-280Zm0-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/>
        </svg>
        <span id="imageSearchNoticeText">Uses Google Lens regardless of selected engine.</span>
    </div>
    <div class="imageSearchRow">
        <input type="text" id="imageSearchUrlInput" placeholder="Paste image URL" autocomplete="off">
        <button type="button" id="imageSearchUrlGo" aria-label="Go">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6"/>
            </svg>
        </button>
    </div>
    <div class="imageSearchDivider"><span id="imageSearchOr">or</span></div>
    <button type="button" class="imageSearchUploadBtn" id="imageSearchUploadBtn">
        <svg viewBox="0 -960 960 960" width="18" height="18" fill="currentColor">
            <path d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/>
        </svg>
        <span id="imageSearchUploadBtnText">Upload image</span>
    </button>
    <div class="imageSearchHint" id="imageSearchHintText">Tip: paste an image (Ctrl+V) into the search bar.</div>
    <input type="file" id="imageSearchFileInput" accept="image/*" hidden>
`;
document.body.appendChild(popover);

const urlInput = popover.querySelector("#imageSearchUrlInput");
const urlGoBtn = popover.querySelector("#imageSearchUrlGo");
const uploadBtn = popover.querySelector("#imageSearchUploadBtn");
const fileInput = popover.querySelector("#imageSearchFileInput");
const hintText = popover.querySelector("#imageSearchHintText");

function applyImageSearchTranslations() {
    const lang = (typeof currentLanguage !== "undefined" && currentLanguage) ? currentLanguage : "en";
    const t = (key) => translations?.[lang]?.[key] || translations?.["en"]?.[key];
    if (t("pasteImageURL")) urlInput.placeholder = t("pasteImageURL");
    const uploadText = popover.querySelector("#imageSearchUploadBtnText");
    if (uploadText && t("uploadImage")) uploadText.textContent = t("uploadImage");
    if (t("imageSearchHint")) hintText.textContent = t("imageSearchHint");
    const header = popover.querySelector("#imageSearchHeader");
    if (header && t("imageSearchHeader")) header.textContent = t("imageSearchHeader");
    const orLabel = popover.querySelector("#imageSearchOr");
    if (orLabel && t("imageSearchOr")) orLabel.textContent = t("imageSearchOr");
    const noticeText = popover.querySelector("#imageSearchNoticeText");
    if (noticeText && t("imageSearchNonGoogleNotice")) noticeText.textContent = t("imageSearchNonGoogleNotice");
}
applyImageSearchTranslations();

function positionPopover() {
    const rect = imageSearchIcon.getBoundingClientRect();
    popover.style.position = "absolute";
    popover.style.top = `${rect.bottom + window.scrollY + 8}px`;
    const popoverWidth = popover.offsetWidth || 280;
    let left = rect.left + window.scrollX + (rect.width / 2) - (popoverWidth / 2);
    left = Math.max(8, Math.min(left, window.innerWidth - popoverWidth - 8));
    popover.style.left = `${left}px`;
}

function refreshNotice() {
    const notice = popover.querySelector("#imageSearchNotice");
    if (notice) notice.hidden = isGoogleEngineActive();
}

function showPopover() {
    refreshNotice();
    popover.style.display = "block";
    positionPopover();
    urlInput.focus();
}

function hidePopover() {
    popover.style.display = "none";
}

function triggerUploadPicker() {
    fileInput.click();
}

imageSearchIcon.addEventListener("click", (event) => {
    event.stopPropagation();
    if (isLensActiveEngine()) {
        if (popover.style.display !== "none") hidePopover();
        triggerUploadPicker();
        return;
    }
    if (popover.style.display === "none") {
        showPopover();
    } else {
        hidePopover();
    }
});

document.addEventListener("mousedown", (event) => {
    if (popover.style.display === "none") return;
    if (popover.contains(event.target)) return;
    if (imageSearchIcon.contains(event.target)) return;
    hidePopover();
}, true);

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && popover.style.display !== "none") {
        hidePopover();
    }
});

window.addEventListener("resize", () => {
    if (popover.style.display !== "none") positionPopover();
});

function isValidHttpUrl(value) {
    try {
        const parsed = new URL(value);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
}

const urlRow = popover.querySelector(".imageSearchRow");

function submitUrl() {
    const value = urlInput.value.trim();
    if (!value) return;
    if (!isValidHttpUrl(value)) {
        urlRow.classList.add("invalid");
        return;
    }
    urlRow.classList.remove("invalid");
    openImageSearchByUrl(value);
    hidePopover();
}

urlGoBtn.addEventListener("click", submitUrl);
urlInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        submitUrl();
    }
});
urlInput.addEventListener("input", () => urlRow.classList.remove("invalid"));

uploadBtn.addEventListener("click", triggerUploadPicker);
fileInput.addEventListener("change", () => {
    if (fileInput.files && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        openImageSearchWithBlob(file, file.name);
        fileInput.value = "";
        hidePopover();
    }
});

async function dataUrlToBlob(dataUrl) {
    const res = await fetch(dataUrl);
    return res.blob();
}

// Paste image directly into the search bar (only when feature is enabled)
const searchInputEl = document.getElementById("searchQ");
searchInputEl.addEventListener("paste", (event) => {
    if (localStorage.getItem("imageSearchIconVisible") === "false" && !isLensActiveEngine()) return;
    const cd = event.clipboardData;
    if (!cd) return;
    // 1) File items (most common: copied image / screenshot)
    for (const item of cd.items || []) {
        if (item.kind === "file" && item.type.startsWith("image/")) {
            event.preventDefault();
            const blob = item.getAsFile();
            if (blob) {
                openImageSearchWithBlob(blob, blob.name || "pasted-image");
            } else {
                openImageSearchUpload();
            }
            return;
        }
    }
    // 2) base64 data URL pasted as text (jpg/jpeg/png/bmp/tif/tiff/webp)
    const text = (cd.getData("text") || "").trim();
    if (text && isDataUrlImage(text)) {
        event.preventDefault();
        dataUrlToBlob(text)
            .then((blob) => openImageSearchWithBlob(blob, "pasted-image"))
            .catch(() => openImageSearchUpload());
    }
});

// ---- Lens engine integration ----
// When engine6 (Lens) is the active search engine, the searchbar Lens icon
// becomes an upload icon (clicking it opens the file picker directly), the
// input placeholder switches to "Paste an Image or URL", and submitting a
// query routes to Lens (URL or data URL) instead of a normal text search.
const lensSvgEl = document.getElementById("imageSearchLensSvg");
const uploadSvgEl = document.getElementById("imageSearchUploadSvg");

function applyLensModeUi() {
    const lensActive = isLensActiveEngine();
    if (lensSvgEl && uploadSvgEl) {
        lensSvgEl.style.display = lensActive ? "none" : "";
        uploadSvgEl.style.display = lensActive ? "" : "none";
    }
    const lang = (typeof currentLanguage !== "undefined" && currentLanguage) ? currentLanguage : "en";
    const t = (key) => translations?.[lang]?.[key] || translations?.["en"]?.[key];
    const placeholderKey = lensActive ? "lensSearchPlaceholder" : "searchPlaceholder";
    const placeholderText = t(placeholderKey);
    if (placeholderText) searchInputEl.placeholder = placeholderText;
    const titleKey = lensActive ? "uploadImage" : "imageSearchHeader";
    const titleText = t(titleKey);
    if (titleText) imageSearchIcon.title = titleText;
    if (lensActive && popover.style.display !== "none") hidePopover();
}

document.querySelectorAll('input[name="search-engine"]').forEach((radio) => {
    radio.addEventListener("change", applyLensModeUi);
});
// The engine-list click handler in search.js sets `radio.checked = true`
// programmatically, which doesn't fire a `change` event. Listen on the
// `.search-engine` divs and the dropdown items so the Lens UI follows
// engine switches via click, dropdown, swipe, or scroll.
document.querySelectorAll(".search-engine, .dropdown-item").forEach((el) => {
    el.addEventListener("click", () => setTimeout(applyLensModeUi, 0));
});
const dropdownBtnEl = document.querySelector(".dropdown-btn");
dropdownBtnEl?.addEventListener("wheel", () => setTimeout(applyLensModeUi, 250), { passive: true });
dropdownBtnEl?.addEventListener("touchend", () => setTimeout(applyLensModeUi, 250), { passive: true });
applyLensModeUi();

// Submitting the search bar while Lens is the active engine: route URL/data
// URL to Lens; empty or unrecognized text falls back to the upload page.
async function handleLensQuery(rawQuery) {
    const value = (rawQuery || "").trim();
    if (!value) {
        openImageSearchUpload();
        return;
    }
    if (isDataUrlImage(value)) {
        try {
            const blob = await dataUrlToBlob(value);
            await openImageSearchWithBlob(blob, "pasted-image");
        } catch {
            openImageSearchUpload();
        }
        return;
    }
    if (isValidHttpUrl(value)) {
        openImageSearchByUrl(value);
        return;
    }
    openImageSearchUpload();
}
window.handleLensQuery = handleLensQuery;

// Ctrl+Shift+L: switch active search engine to Lens (engine6)
document.addEventListener("keydown", (event) => {
    if (!event.ctrlKey || !event.shiftKey || event.altKey || event.metaKey) return;
    if ((event.key || "").toLowerCase() !== "l") return;
    // Don't intercept while the user is typing in an unrelated editable
    // (todo input, bookmark fields, etc). The search input is allowed —
    // switching engines mid-query is the expected use case.
    const target = event.target;
    if (target && target !== searchInputEl) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) return;
    }
    const lensRadio = document.querySelector(`input[name="search-engine"][value="${LENS_ENGINE_VALUE}"]`);
    if (!lensRadio) return;
    event.preventDefault();
    const engineDiv = lensRadio.closest(".search-engine");
    if (engineDiv) {
        engineDiv.click();
    } else {
        lensRadio.checked = true;
        lensRadio.dispatchEvent(new Event("change"));
    }
    if (typeof toggleSearchEngines === "function") toggleSearchEngines("search-on");
    searchInputEl.focus();
});
//  -----------End of Search by Image------------
