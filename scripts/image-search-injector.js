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
// Two injection strategies, picked by browser:
//
// Chrome — synthetic drag-drop on the Lens dialog.
//   www.google.com/?olud hosts BOTH the Lens upload modal and Google's
//   AI Mode / Search file-attachment input. Populating any visible file
//   input often routes images to Gemini ("JPEG is a digital image
//   format...") rather than reverse image search, so we dispatch
//   synthetic dragenter/dragover/drop with a populated DataTransfer
//   onto the visible Lens dialog. Lens's drop handler reads the file
//   and proceeds with its normal upload flow.
//
// Firefox — direct <input type="file"> injection.
//   Firefox does serve the Lens dialog, but rejects synthetic drop
//   events with non-trusted DataTransfer files. The drop event fires,
//   Lens silently discards it, and the dialog closes without a search.
//   So on Firefox we fall back to populating the most Lens-y file
//   input on the page (scored by accept attr and surrounding text).
//   This sometimes lands on Google's AI Mode input instead — a known
//   limitation, but better than the silent no-op the drag-drop path
//   produces on Firefox.
//
// In both cases, if we can't find a target within INJECT_TIMEOUT_MS we
// silently give up; the page is already loaded so the user can drop or
// pick the file manually.

(function () {
    const HASH_PREFIX = "#mynt-image-search=";
    const INJECT_TIMEOUT_MS = 15000;
    const LOG_PREFIX = "[MYNT image search]";

    if (!location.hash.startsWith(HASH_PREFIX)) return;

    const IS_FIREFOX = /Firefox\//.test(navigator.userAgent);

    const api = (typeof browser !== "undefined" ? browser : chrome);
    const storage = api.storage.local;

    function getRuntimeLastError() {
        try {
            return api?.runtime?.lastError || null;
        } catch {
            return null;
        }
    }

    function storageGet(key) {
        return new Promise((resolve, reject) => {
            let settled = false;
            const finish = (items) => {
                if (settled) return;
                settled = true;
                const err = getRuntimeLastError();
                if (err) reject(err); else resolve(items || {});
            };
            try {
                const result = storage.get(key, finish);
                if (result && typeof result.then === "function") {
                    result.then(resolve, reject);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    function storageRemove(key) {
        try {
            const result = storage.remove(key);
            if (result && typeof result.catch === "function") {
                result.catch(() => {});
            }
        } catch {
            // Best effort cleanup only.
        }
    }

    const rawKey = location.hash.slice(HASH_PREFIX.length);
    let key;
    try {
        key = decodeURIComponent(rawKey);
    } catch (err) {
        if (err instanceof URIError) {
            // Best-effort cleanup of the stashed payload, then bail.
            storageRemove(rawKey);
            history.replaceState(null, "", location.pathname + location.search);
            return;
        }
        throw err;
    }
    if (!key) return;

    // Strip the hash so a refresh doesn't re-trigger the injection.
    history.replaceState(null, "", location.pathname + location.search);

    storageGet(key).then((items) => {
        const payload = items?.[key];
        storageRemove(key);
        if (!payload || !payload.dataUrl) {
            console.debug(LOG_PREFIX, "no payload found for key", key);
            return;
        }

        const inject = IS_FIREFOX
            ? (file) => waitForFileInput(INJECT_TIMEOUT_MS).then((input) => {
                injectFile(input, file);
                console.debug(LOG_PREFIX, "image injected into file input");
            })
            : (file) => waitForLensDropZone(INJECT_TIMEOUT_MS).then((zone) => new Promise((resolve) => {
                setTimeout(() => {
                    dispatchDrop(zone, file);
                    console.debug(LOG_PREFIX, "image dropped on Lens dialog");
                    resolve();
                }, 150);
            }));

        dataUrlToFile(payload.dataUrl, payload.name || "image", payload.type || "image/png")
            .then(inject)
            .catch((err) => console.debug(LOG_PREFIX, "injection failed, falling back to manual upload:", err.message));
    }).catch((err) => console.debug(LOG_PREFIX, "payload lookup failed:", err.message));

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

    function isVisible(el) {
        if (!el || !el.getBoundingClientRect) return false;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        const style = el.ownerDocument.defaultView.getComputedStyle(el);
        return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
    }

    // Match any visible element whose own direct text is a Lens signal.
    // Visibility alone is enough to reject the original false positive
    // (a hidden Lens-button label on the homepage), and avoids requiring
    // a [role="dialog"] wrapper that Firefox's Lens dialog doesn't always
    // place around the relevant header element.
    function findLensAnchor() {
        if (!document.body) return null;
        for (const el of document.body.querySelectorAll("*")) {
            if (hasOwnLensText(el) && isVisible(el)) return el;
        }
        // Fallback: a visible dialog labelled "lens" or "image".
        for (const d of document.querySelectorAll('[role="dialog"], [aria-modal="true"]')) {
            if (!isVisible(d)) continue;
            const label = (d.getAttribute("aria-label") || "").toLowerCase();
            if (label.includes("lens") || label.includes("image")) return d;
        }
        return null;
    }

    function findLensDropZone() {
        // Dispatch directly on the anchor element. Drag events bubble, so
        // any drop handler attached on an ancestor (the actual dialog
        // drop zone) will still fire. Walking up blindly used to overshoot
        // and land on a dialog-dismiss wrapper, which closed the dialog
        // without triggering the upload.
        return findLensAnchor();
    }

    function waitForLensDropZone(timeoutMs) {
        return new Promise((resolve, reject) => {
            const existing = findLensDropZone();
            if (existing) return resolve(existing);

            // Coalesce mutation bursts: Google's homepage triggers many
            // mutations per frame. Run findLensDropZone (which scans the
            // DOM) at most once per animation frame.
            let scheduled = 0;
            let settled = false;

            const tryFind = () => {
                scheduled = 0;
                if (settled) return;
                const zone = findLensDropZone();
                if (zone) {
                    settled = true;
                    observer.disconnect();
                    clearInterval(poll);
                    clearTimeout(timer);
                    resolve(zone);
                }
            };

            const observer = new MutationObserver(() => {
                if (settled || scheduled) return;
                scheduled = requestAnimationFrame(tryFind);
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });

            // MutationObserver only fires on DOM changes. The Lens dialog
            // can become visible via a CSS transition without any DOM
            // mutation, so we also poll for visibility changes.
            const poll = setInterval(() => {
                if (settled || scheduled) return;
                scheduled = requestAnimationFrame(tryFind);
            }, 250);

            const timer = setTimeout(() => {
                if (settled) return;
                settled = true;
                if (scheduled) cancelAnimationFrame(scheduled);
                observer.disconnect();
                clearInterval(poll);
                reject(new Error(`Lens drop zone not found within ${timeoutMs}ms`));
            }, timeoutMs);
        });
    }

    // ---- Firefox file-input strategy ----

    function* walkInputs(root) {
        if (!root) return;
        const inputs = root.querySelectorAll ? root.querySelectorAll('input[type="file"]') : [];
        for (const input of inputs) yield input;
        const all = root.querySelectorAll ? root.querySelectorAll("*") : [];
        for (const el of all) {
            if (el.shadowRoot) yield* walkInputs(el.shadowRoot);
        }
    }

    function getInputContext(input) {
        let node = input;
        for (let depth = 0; node && depth < 6; depth += 1) {
            const text = node.textContent?.trim();
            if (text) return text.toLowerCase();
            node = node.parentElement || node.getRootNode()?.host;
        }
        return "";
    }

    function scoreFileInput(input) {
        const accept = (input.accept || "").toLowerCase();
        const context = getInputContext(input);
        let score = 0;
        if (/\.(jpe?g|png|bmp|tiff?|webp)/.test(accept)) score += 4;
        if (accept.includes("image")) score += 2;
        if (context.includes("google lens")) score += 5;
        if (context.includes("search any image")) score += 5;
        if (context.includes("drag an image")) score += 4;
        if (context.includes("upload a file")) score += 4;
        if (input.closest('[role="dialog"], [aria-modal="true"]')) score += 2;
        return score;
    }

    function findFileInput() {
        const candidates = [];
        for (const input of walkInputs(document)) {
            const accept = (input.accept || "").toLowerCase();
            if (input.disabled) continue;
            if (accept && !accept.includes("image") && accept !== "*/*" && !/\.(jpe?g|png|bmp|tiff?|webp)/.test(accept)) continue;
            candidates.push({ input, score: scoreFileInput(input) });
        }
        candidates.sort((a, b) => b.score - a.score);
        return candidates[0]?.input || null;
    }

    function waitForFileInput(timeoutMs) {
        return new Promise((resolve, reject) => {
            const existing = findFileInput();
            if (existing) return resolve(existing);

            const observer = new MutationObserver(() => {
                const input = findFileInput();
                if (input) {
                    observer.disconnect();
                    clearTimeout(timer);
                    resolve(input);
                }
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });

            const timer = setTimeout(() => {
                observer.disconnect();
                reject(new Error(`file input not found within ${timeoutMs}ms`));
            }, timeoutMs);
        });
    }

    function injectFile(input, file) {
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
        input.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // ---- Chrome drag-drop strategy ----

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
