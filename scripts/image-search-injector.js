/*
 * Material You New Tab
 * Copyright (c) 2024-2026 Prem, 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

// Content script: receives a pasted/uploaded image from the new-tab page and
// hands it off to Google Lens's upload modal at https://www.google.com/?olud.
//
// Hand-off: the new-tab page stashes a base64 data URL in extension storage
// under a random key, then navigates here with `#mynt-image-search=<key>`.
// We retrieve it, rebuild a File, and inject it into the Lens dialog.
//
// Why drag-drop and not <input type="file">:
// The Lens upload modal does NOT expose a normal `<input type="file">` we
// can populate. The only file inputs visible on www.google.com/?olud belong
// to Google's *AI Mode / Search* attachment feature, which sits on the same
// page. Routing an image into those inputs sends it to Gemini ("JPEG is a
// digital image format..."), not to the reverse-image-search results we
// actually want. Earlier attempts to score / nearest-distance the right
// input still picked AI Mode because Lens's upload is gated behind a
// custom drag-drop handler, with no inspectable input element.
//
// So instead we:
//   1. Find the Lens dialog by anchoring on its visible header text
//      ("Search any image with Google Lens" / "Drag an image here").
//   2. Dispatch synthetic dragenter/dragover/drop events with a populated
//      DataTransfer onto the dialog. Lens's drop handler reads the file
//      from the event and proceeds to its normal upload flow.
//
// If we can't find the dialog within INJECT_TIMEOUT_MS we silently give up;
// the page is already loaded so the user can drop the file manually.

(function () {
    const HASH_PREFIX = "#mynt-image-search=";
    const INJECT_TIMEOUT_MS = 15000;
    const LOG_PREFIX = "[MYNT image search]";

    if (!location.hash.startsWith(HASH_PREFIX)) return;

    const api = (typeof browser !== "undefined" ? browser : chrome);
    const storage = api.storage.local;

    const rawKey = location.hash.slice(HASH_PREFIX.length);
    let key;
    try {
        key = decodeURIComponent(rawKey);
    } catch (err) {
        if (err instanceof URIError) {
            // Best-effort cleanup of the stashed payload, then bail.
            storage.remove(rawKey);
            history.replaceState(null, "", location.pathname + location.search);
            return;
        }
        throw err;
    }
    if (!key) return;

    // Strip the hash so a refresh doesn't re-trigger the injection.
    history.replaceState(null, "", location.pathname + location.search);

    storage.get(key, (items) => {
        const payload = items?.[key];
        storage.remove(key);
        if (!payload || !payload.dataUrl) {
            console.debug(LOG_PREFIX, "no payload found for key", key);
            return;
        }

        dataUrlToFile(payload.dataUrl, payload.name || "image", payload.type || "image/png")
            .then((file) => waitForLensDropZone(INJECT_TIMEOUT_MS).then((zone) => {
                return new Promise((resolve) => setTimeout(() => {
                    dispatchDrop(zone, file);
                    resolve();
                }, 150));
            }))
            .then(() => console.debug(LOG_PREFIX, "image dropped on Lens dialog"))
            .catch((err) => console.debug(LOG_PREFIX, "injection failed, falling back to manual upload:", err.message));
    });

    async function dataUrlToFile(dataUrl, name, type) {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const ext = (blob.type.split("/")[1] || "png").split("+")[0];
        const fileName = name.includes(".") ? name : `${name}.${ext}`;
        return new File([blob], fileName, { type: blob.type || type });
    }

    const LENS_TEXT_SIGNALS = [
        "search any image with google lens",
        "drag an image here",
        "paste image link",
    ];

    function matchesLensText(text) {
        const lower = (text || "").toLowerCase();
        return LENS_TEXT_SIGNALS.some((sig) => lower.includes(sig));
    }

    // True only when an element's own direct text (not its descendants')
    // matches a Lens signal. Necessary because <body>.textContent contains
    // every word on the page including the Lens dialog's text.
    function hasOwnLensText(el) {
        if (!el || !el.childNodes) return false;
        let direct = "";
        for (const node of el.childNodes) {
            if (node.nodeType === Node.TEXT_NODE) direct += node.textContent;
        }
        return matchesLensText(direct);
    }

    function findLensAnchor() {
        if (!document.body) return null;
        const all = document.body.querySelectorAll("*");
        for (const el of all) {
            if (hasOwnLensText(el)) return el;
        }
        // Fallback: a dialog labelled "lens" or "image"
        const dialogs = document.querySelectorAll('[role="dialog"], [aria-modal="true"]');
        for (const d of dialogs) {
            const label = (d.getAttribute("aria-label") || "").toLowerCase();
            if (label.includes("lens") || label.includes("image")) return d;
        }
        return null;
    }

    function findLensDropZone() {
        const anchor = findLensAnchor();
        if (!anchor) return null;
        // Walk up a few levels to find the dotted-border drop zone container.
        let zone = anchor;
        for (let i = 0; i < 6 && zone.parentElement && zone.parentElement !== document.body; i += 1) {
            zone = zone.parentElement;
        }
        return zone;
    }

    function waitForLensDropZone(timeoutMs) {
        return new Promise((resolve, reject) => {
            const existing = findLensDropZone();
            if (existing) return resolve(existing);

            const observer = new MutationObserver(() => {
                const zone = findLensDropZone();
                if (zone) {
                    observer.disconnect();
                    clearTimeout(timer);
                    resolve(zone);
                }
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });

            const timer = setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Lens drop zone not found within ${timeoutMs}ms`));
            }, timeoutMs);
        });
    }

    function dispatchDrop(zone, file) {
        const dt = new DataTransfer();
        dt.items.add(file);
        const make = (type) => new DragEvent(type, {
            bubbles: true,
            cancelable: true,
            composed: true,
            dataTransfer: dt,
        });
        // Some pages bind drag handlers a few levels below the visible
        // container, so dispatch on the zone and let the events bubble.
        zone.dispatchEvent(make("dragenter"));
        zone.dispatchEvent(make("dragover"));
        zone.dispatchEvent(make("drop"));
        console.debug(LOG_PREFIX, "drop dispatched on:", zone.tagName, zone.className);
    }

})();
