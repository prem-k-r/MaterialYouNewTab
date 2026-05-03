/*
 * Material You New Tab
 * Copyright (c) 2024-2026 Prem, 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

// Content script: receives a pasted/uploaded image from the new-tab page and
// drops it into the reverse-image-search upload input on Google Lens or Bing
// Visual Search.
//
// Hand-off: the new-tab page stashes a base64 data URL in extension storage
// under a random key, then navigates here with `#mynt-image-search=<key>`.
// We retrieve it, build a File, set it on the page's <input type="file">, and
// dispatch the events the page expects.
//
// If we can't find the input within INJECT_TIMEOUT_MS we silently give up;
// the page is already loaded so the user can drop the file manually (the
// Option-A fallback).

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
            .then((file) => waitForFileInput(INJECT_TIMEOUT_MS).then((input) => injectFile(input, file)))
            .then(() => console.debug(LOG_PREFIX, "image injected successfully"))
            .catch((err) => console.debug(LOG_PREFIX, "injection failed, falling back to manual upload:", err.message));
    });

    async function dataUrlToFile(dataUrl, name, type) {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const ext = (blob.type.split("/")[1] || "png").split("+")[0];
        const fileName = name.includes(".") ? name : `${name}.${ext}`;
        return new File([blob], fileName, { type: blob.type || type });
    }

    // Recursively collect <input type="file"> across the document and any open
    // shadow roots (Bing's visual search uses a deep tree).
    function* walkInputs(root) {
        if (!root) return;
        const inputs = root.querySelectorAll ? root.querySelectorAll('input[type="file"]') : [];
        for (const input of inputs) yield input;
        const all = root.querySelectorAll ? root.querySelectorAll("*") : [];
        for (const el of all) {
            if (el.shadowRoot) yield* walkInputs(el.shadowRoot);
        }
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

    function getInputContext(input) {
        let node = input;
        for (let depth = 0; node && depth < 6; depth += 1) {
            const text = node.textContent?.trim();
            if (text) return text.toLowerCase();
            node = node.parentElement || node.getRootNode()?.host;
        }
        return "";
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
})();
