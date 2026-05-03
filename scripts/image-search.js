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

const googleEngineValues = new Set(["engine1", "engine6"]);

function isGoogleEngineActive() {
    const selected = document.querySelector('input[name="search-engine"]:checked');
    return selected ? googleEngineValues.has(selected.value) : false;
}

function openImageSearchByUrl(url) {
    window.open(googleLensByUrl(url), "_blank", "noopener");
}

function openImageSearchUpload() {
    window.open(googleLensUpload, "_blank", "noopener");
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
        const api = (typeof browser !== "undefined" ? browser : chrome);
        return api?.storage?.local || null;
    } catch {
        return null;
    }
}

async function openImageSearchWithBlob(blob, name) {
    const storage = getStorage();
    if (!storage) {
        openImageSearchUpload();
        return;
    }
    try {
        const dataUrl = await blobToDataUrl(blob);
        const key = `mynt-img-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        await new Promise((resolve, reject) => {
            storage.set({ [key]: { dataUrl, name: name || "image", type: blob.type } }, () => {
                const err = (typeof browser !== "undefined" ? browser : chrome).runtime?.lastError;
                if (err) reject(err); else resolve();
            });
        });
        window.open(`${googleLensUpload}#mynt-image-search=${encodeURIComponent(key)}`, "_blank", "noopener");
    } catch {
        openImageSearchUpload();
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

imageSearchIcon.addEventListener("click", (event) => {
    event.stopPropagation();
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

uploadBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => {
    if (fileInput.files && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        openImageSearchWithBlob(file, file.name);
        fileInput.value = "";
        hidePopover();
    }
});

// Paste image directly into the search bar (only when feature is enabled)
const searchInputEl = document.getElementById("searchQ");
searchInputEl.addEventListener("paste", (event) => {
    if (localStorage.getItem("imageSearchIconVisible") === "false") return;
    const items = event.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
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
});
//  -----------End of Search by Image------------
