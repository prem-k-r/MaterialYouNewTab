/*
 * Material You New Tab
 * Copyright (c) 2024-2026 Prem, 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

// ------------------------------------ Tips ------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    // Hide tips that are not relevant to mobile
    if (!isDesktop) {
        //document.querySelectorAll('.hideOnMobile').forEach(el => el.style.display = 'none');
        localStorage.setItem("hideTips", "true");
    }

    // Determine the correct key for adjustZoomInfo based on OS
    const adjustZoomInfo = document.getElementById("adjustZoomInfo");
    let adjustZoomInfoText = translations[currentLanguage]?.adjustZoomInfo || translations["en"].adjustZoomInfo;
    if (isMac) {
        adjustZoomInfoText = adjustZoomInfoText.replace(/Ctrl/g, "⌘");
    }
    adjustZoomInfo.textContent = adjustZoomInfoText;

    // Change browser theme info based on the user's browser
    const changeBrowserThemeInfo = document.getElementById("changeBrowserThemeInfo");
    if (isFirefoxAll) {
        changeBrowserThemeInfo.innerHTML = translations[currentLanguage]?.firefoxThemeInfo || translations["en"].firefoxThemeInfo;
    } else if (isEdge) {
        changeBrowserThemeInfo.innerHTML = translations[currentLanguage]?.edgeThemeInfo || translations["en"].edgeThemeInfo;
    } else if (isBrave) {
        changeBrowserThemeInfo.innerHTML = translations[currentLanguage]?.braveThemeInfo || translations["en"].braveThemeInfo;
    } else {
        changeBrowserThemeInfo.innerHTML = translations[currentLanguage]?.chromeThemeInfo || translations["en"].chromeThemeInfo;
    }

    const firefoxHomepage = document.getElementById("firefoxHomepage");
    const updateFirefoxHomepageInfo = document.getElementById("updateFirefoxHomepageInfo");
    if (isFirefox) {
        firefoxHomepage.style.display = "block";
        updateFirefoxHomepageInfo.innerHTML = translations[currentLanguage]?.updateFirefoxHomepageInfo || translations["en"].updateFirefoxHomepageInfo;
    }

    // Hide tips
    const tips = document.getElementById("tips");
    const dontShowButton = document.getElementById("dontShowTips");

    // Check if the user has previously disabled tips
    if (localStorage.getItem("hideTips") === "true") {
        tips.classList.add("tips-hidden");
    }

    // Hide tips and save preference when button is clicked
    dontShowButton.addEventListener("click", function () {
        tips.classList.add("tips-hidden");
        localStorage.setItem("hideTips", "true"); // Save preference
    });
});


// ------------------------------- Footer Toast -------------------------------
(function () {
    if (isFirefoxAll || !isDesktop) return; // Don't show on Firefox or mobile

    const TOAST_DURATION = 30 * 1000; // 30 seconds
    const STORAGE_KEY = 'chrome-footer-toast-shown';

    const toast = document.getElementById('chromeFooterToast');
    const progressBar = document.getElementById('toastProgressBar');
    const closeBtn = document.getElementById('toastClose');

    let progressInterval;
    let elapsedTime = 0;
    let lastTick = 0;
    let isPaused = false;

    function showToast() {
        // Check if toast has been shown before
        const hasShown = localStorage.getItem(STORAGE_KEY);
        if (hasShown) return;

        // Mark as shown
        localStorage.setItem(STORAGE_KEY, 'true');

        // Show toast after brief delay
        setTimeout(() => {
            toast.classList.add('show');
            startProgress();
        }, 1500);
    }

    function hideToast() {
        toast.classList.remove('show');
        clearInterval(progressInterval);
    }

    function startProgress() {
        lastTick = Date.now();

        progressInterval = setInterval(() => {
            if (isPaused) return;

            const now = Date.now();
            elapsedTime += now - lastTick;
            lastTick = now;

            const remaining = Math.max(0, 100 - (elapsedTime / TOAST_DURATION) * 100);

            progressBar.style.width = remaining + '%';

            if (elapsedTime >= TOAST_DURATION) {
                hideToast();
            }
        }, 50);
    }

    // Hover pause
    toast.addEventListener('mouseenter', () => {
        isPaused = true;
    });

    toast.addEventListener('mouseleave', () => {
        isPaused = false;
        lastTick = Date.now();
    });

    closeBtn.addEventListener('click', hideToast);

    showToast();
})();


// ------------------------------- Custom Select -------------------------------
/*
 * Reusable styled dropdown that replaces a native <select>.
 *   Markup: <select id="x" data-custom-select>...</select>
 *   Script: initCustomSelect(el)
 *
 * Keeps the hidden native <select> as the source of truth so value, selectedIndex,
 * disabled, focus(), option mutations, and "change" events continue working as usual.
 */
(function () {
    const CHEVRON = '<svg class="cs-chevron" viewBox="-40 -40 600 600" aria-hidden="true"><path d="M476 178 271 385c-6 6-16 6-22 0L44 178c-6-6-6-16 0-22l22-22c6-6 16-6 22 0l161 163c6 6 16 6 22 0l161-162c6-6 16-6 22 0l22 22c5 6 5 15 0 21z"/></svg>';
    const CHECK = '<svg class="cs-check" viewBox="0 0 520 520" aria-hidden="true"><path d="M191 425 26 259c-6-6-6-16 0-22l22-22c6-6 16-6 22 0l124 125a10 10 0 0 0 15 0L452 95c6-6 16-6 22 0l22 22c6 6 6 16 0 22L213 425c-6 7-16 7-22 0z"/></svg>';
    const valueDesc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");
    const indexDesc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "selectedIndex");
    let uid = 0;

    function initCustomSelect(select) {
        if (!select || select.tagName !== "SELECT") return null;
        if (select._customSelect) return select._customSelect;

        const id = "cs" + (++uid);
        const menuId = id + "-menu";
        let isOpen = false;
        let active = -1;
        let typeBuffer = "";
        let typeTimer = 0;
        let frame = 0;

        const trigger = document.createElement("div");
        trigger.className = ("cs-trigger " + select.className).trim();
        trigger.tabIndex = 0;
        trigger.setAttribute("role", "combobox");
        trigger.setAttribute("aria-haspopup", "listbox");
        trigger.setAttribute("aria-expanded", "false");
        trigger.setAttribute("aria-controls", menuId);
        trigger.innerHTML = '<span class="cs-value"></span>' + CHEVRON;
        const valueEl = trigger.firstElementChild;

        const labelEl = select.labels && select.labels[0];
        if (labelEl) {
            if (!labelEl.id) labelEl.id = id + "-label";
            trigger.setAttribute("aria-labelledby", labelEl.id);
        } else if (select.getAttribute("aria-label")) {
            trigger.setAttribute("aria-label", select.getAttribute("aria-label"));
        }

        const menu = document.createElement("div");
        menu.className = "cs-menu";
        menu.id = menuId;
        menu.setAttribute("role", "listbox");

        // Place trigger before select so "select + label" floating-label CSS still works
        select.before(trigger);
        document.body.appendChild(menu);
        select.style.display = "none";
        select.setAttribute("aria-hidden", "true");
        select.tabIndex = -1;

        function sync() {
            const option = select.options[select.selectedIndex];
            // Strip leading em-spaces used for nested folder indentation in the list
            valueEl.textContent = (option ? option.textContent.replace(/^[\s\u2003]+/, "") : "") || "\u00a0";
            trigger.title = option && option.title ? option.title : "";

            const disabled = select.disabled;
            trigger.classList.toggle("cs-disabled", disabled);
            trigger.setAttribute("aria-disabled", String(disabled));
            trigger.tabIndex = disabled ? -1 : 0;
            if (disabled && isOpen) closeMenu();
            else if (isOpen) renderItems();
        }

        function renderItems() {
            menu.replaceChildren(...Array.from(select.options).map((option, i) => {
                const item = document.createElement("div");
                item.className = ("cs-option " + option.className).trim();
                item.id = menuId + "-" + i;
                item.dataset.index = i;
                item.setAttribute("role", "option");
                const text = document.createElement("span");
                text.className = "cs-option-text";
                text.textContent = option.textContent;
                item.appendChild(text);
                if (option.title) item.title = option.title;
                if (option.disabled) {
                    item.classList.add("cs-option-disabled");
                    item.setAttribute("aria-disabled", "true");
                }
                const selected = i === select.selectedIndex;
                item.setAttribute("aria-selected", String(selected));
                if (selected) {
                    item.classList.add("cs-selected");
                    item.insertAdjacentHTML("beforeend", CHECK);
                }
                return item;
            }));
            if (active >= menu.children.length) active = -1;
            if (active >= 0) setActive(active, false);
        }

        function setActive(index, scroll = true) {
            if (menu.children[active]) menu.children[active].classList.remove("cs-active");
            active = index;
            const item = menu.children[index];
            if (!item) return;
            item.classList.add("cs-active");
            trigger.setAttribute("aria-activedescendant", item.id);
            if (scroll && item.scrollIntoView) item.scrollIntoView({ block: "nearest" });
        }

        function position() {
            if (!trigger.getClientRects().length) { // trigger got hidden (e.g. its modal closed)
                closeMenu();
                return;
            }
            const gap = 6, margin = 8;
            const rect = trigger.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom - gap - margin;
            const spaceAbove = rect.top - gap - margin;
            const natural = Math.min(menu.scrollHeight, 320);
            const below = spaceBelow >= natural || spaceBelow >= spaceAbove;

            menu.style.minWidth = rect.width + "px";
            menu.style.maxHeight = Math.max(120, Math.min(320, below ? spaceBelow : spaceAbove)) + "px";
            const width = menu.offsetWidth;
            const height = menu.offsetHeight;

            let left = getComputedStyle(trigger).direction === "rtl" ? rect.right - width : rect.left;
            left = Math.max(margin, Math.min(left, window.innerWidth - margin - width));
            menu.style.left = left + "px";
            menu.style.top = (below ? rect.bottom + gap : rect.top - gap - height) + "px";
            menu.classList.toggle("cs-above", !below);
        }

        function schedulePosition() {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(position);
        }

        function onOutsidePointer(event) {
            if (!trigger.contains(event.target) && !menu.contains(event.target)) closeMenu();
        }

        function onScroll(event) {
            if (!menu.contains(event.target)) schedulePosition();
        }

        function openMenu() {
            if (isOpen || select.disabled) return;
            isOpen = true;
            renderItems();
            trigger.classList.add("cs-open");
            trigger.setAttribute("aria-expanded", "true");
            position();
            menu.classList.add("cs-visible");
            setActive(select.selectedIndex >= 0 ? select.selectedIndex : step(-1, 1));
            document.addEventListener("pointerdown", onOutsidePointer, true);
            window.addEventListener("resize", schedulePosition);
            window.addEventListener("scroll", onScroll, true);
        }

        function closeMenu() {
            if (!isOpen) return;
            isOpen = false;
            cancelAnimationFrame(frame);
            menu.classList.remove("cs-visible");
            trigger.classList.remove("cs-open");
            trigger.setAttribute("aria-expanded", "false");
            trigger.removeAttribute("aria-activedescendant");
            document.removeEventListener("pointerdown", onOutsidePointer, true);
            window.removeEventListener("resize", schedulePosition);
            window.removeEventListener("scroll", onScroll, true);
            typeBuffer = "";
        }

        function choose(index) {
            const option = select.options[index];
            if (!option || option.disabled) return;
            const changed = index !== select.selectedIndex;
            indexDesc.set.call(select, index);
            closeMenu();
            sync();
            if (changed) {
                select.dispatchEvent(new Event("input", { bubbles: true }));
                select.dispatchEvent(new Event("change", { bubbles: true }));
            }
            trigger.focus();
        }

        function step(from, dir) {
            for (let i = from + dir; i >= 0 && i < select.options.length; i += dir) {
                if (!select.options[i].disabled) return i;
            }
            return from;
        }

        function typeahead(character) {
            clearTimeout(typeTimer);
            typeBuffer += character.toLowerCase();
            typeTimer = setTimeout(() => { typeBuffer = ""; }, 600);
            const options = Array.from(select.options);
            const from = typeBuffer.length === 1 ? active + 1 : Math.max(active, 0);
            for (let n = 0; n < options.length; n++) {
                const i = (from + n) % options.length;
                if (!options[i].disabled && options[i].textContent.trim().toLowerCase().startsWith(typeBuffer)) {
                    setActive(i);
                    return;
                }
            }
        }

        trigger.addEventListener("click", () => (isOpen ? closeMenu() : openMenu()));

        trigger.addEventListener("keydown", event => {
            // Prevent page shortcuts from firing while interacting with the dropdown
            if (event.key !== "Tab") event.stopPropagation();
            if (select.disabled) return;
            const key = event.key;
            const isCharacter = key.length === 1 && key !== " " && !event.ctrlKey && !event.metaKey && !event.altKey;

            if (!isOpen) {
                if (key === "ArrowDown" || key === "ArrowUp" || key === "Enter" || key === " ") {
                    event.preventDefault();
                    openMenu();
                } else if (isCharacter) {
                    openMenu();
                    typeahead(key);
                }
                return;
            }

            switch (key) {
                case "ArrowDown": event.preventDefault(); setActive(step(active, 1)); break;
                case "ArrowUp": event.preventDefault(); setActive(step(active, -1)); break;
                case "Home": event.preventDefault(); setActive(step(-1, 1)); break;
                case "End": event.preventDefault(); setActive(step(select.options.length, -1)); break;
                case "Enter":
                case " ": event.preventDefault(); choose(active); break;
                case "Escape": event.preventDefault(); closeMenu(); break;
                case "Tab":
                    if (active >= 0) choose(active);
                    closeMenu(); // Ensure menu closes even if the active option is disabled
                    break;
                default: if (isCharacter) typeahead(key);
            }
        });

        menu.addEventListener("mousedown", event => event.preventDefault()); // Keep focus on the trigger
        menu.addEventListener("click", event => {
            // Menu is mounted on <body>, so stop propagation to avoid triggering outside-click handlers on modals/panels
            event.stopPropagation();
            const item = event.target.closest(".cs-option");
            if (item) choose(Number(item.dataset.index));
        });
        menu.addEventListener("mousemove", event => {
            const item = event.target.closest(".cs-option");
            if (item && !item.classList.contains("cs-option-disabled") && Number(item.dataset.index) !== active) {
                setActive(Number(item.dataset.index), false);
            }
        });

        // Keep custom UI in sync with direct mutations on the native <select>
        Object.defineProperty(select, "value", {
            configurable: true,
            get() { return valueDesc.get.call(this); },
            set(newValue) { valueDesc.set.call(this, newValue); sync(); }
        });
        Object.defineProperty(select, "selectedIndex", {
            configurable: true,
            get() { return indexDesc.get.call(this); },
            set(newIndex) { indexDesc.set.call(this, newIndex); sync(); }
        });
        select.focus = options => trigger.focus(options);
        select.addEventListener("change", sync);
        const observer = new MutationObserver(sync);
        observer.observe(select, {
            childList: true, subtree: true, characterData: true,
            attributes: true, attributeFilter: ["disabled"]
        });

        sync();
        select._customSelect = { trigger, menu, open: openMenu, close: closeMenu };
        return select._customSelect;
    }

    function initCustomSelects(root = document) {
        root.querySelectorAll("select[data-custom-select]").forEach(initCustomSelect);
    }

    window.initCustomSelect = initCustomSelect;
    window.initCustomSelects = initCustomSelects;

    if (document.readyState === "complete") initCustomSelects();
    else document.addEventListener("DOMContentLoaded", () => initCustomSelects());
})();


// ----------------------- Alt Shortcut Keys & Badges -----------------------
document.addEventListener("DOMContentLoaded", function () {
    const shortcutsSection = document.getElementById("shortcuts-section");
    const shortcutsCheckbox = document.getElementById("shortcutsCheckbox");
    const shortcutsContainer = document.getElementById("shortcutsContainer");
    const aiToolsCont = document.getElementById("aiToolsCont");
    const toolsCont = document.getElementById("toolsCont");
    const aiToolsCheckbox = document.getElementById("aiToolsCheckbox");
    const aiToolsIcon = document.getElementById("aiToolsIcon");
    const bookmarkButton = document.getElementById("bookmarkButton");
    const bookmarksCheckbox = document.getElementById("bookmarksCheckbox");
    const todoListCont = document.getElementById("todoListCont");
    const todoListCheckbox = document.getElementById("todoListCheckbox");
    const menuButton = document.getElementById("menuButton");
    const googleAppsCont = document.getElementById("googleAppsCont");
    const googleAppsCheckbox = document.getElementById("googleAppsCheckbox");
    const micIcon = document.getElementById("micIcon");
    const micIconCheckbox = document.getElementById("micIconCheckbox");

    const COMMAND_TARGETS = {
        "open-bookmarks": {
            action: "toggle-bookmarks",
            el: bookmarkButton,
            isEnabled: () => bookmarksCheckbox?.checked
        },
        "toggle-ai-tools": {
            action: "toggle-ai-tools",
            el: aiToolsIcon,
            isEnabled: () => aiToolsCheckbox?.checked
        },
        "toggle-todo": {
            action: "toggle-todo",
            el: todoListCont,
            isEnabled: () => todoListCheckbox?.checked
        },
        "toggle-settings": {
            action: "toggle-settings",
            el: menuButton,
            isEnabled: () => true
        },
        "toggle-google-apps": {
            action: "toggle-google-apps",
            el: googleAppsCont,
            isEnabled: () => googleAppsCheckbox?.checked
        },
        "voice-search": {
            action: "voice-search",
            el: micIcon,
            isEnabled: () => !micIconCheckbox?.checked && micIcon?.style.display !== "none"
        }
    };

    function getAltCommandKey(shortcut) {
        if (!shortcut || (!shortcut.includes("Alt+") && !shortcut.includes("⌥"))) return null;
        const key = shortcut.split("+").pop().replace(/^[⌥⇧⌘⌃]+/, "").toUpperCase();
        return key.length === 1 ? key : null;
    }

    function applyCommandBadge(el, key) {
        if (!el) return;
        if (key) el.dataset.shortcut = key;
        else delete el.dataset.shortcut;
    }

    function syncCommandBadges() {
        if (!globalThis.chrome?.commands?.getAll) return;
        chrome.commands.getAll((commands) => {
            const byName = Object.fromEntries(commands.map(c => [c.name, c.shortcut]));
            Object.entries(COMMAND_TARGETS).forEach(([name, target]) => {
                applyCommandBadge(target.el, getAltCommandKey(byName[name]));
            });
        });
    }

    syncCommandBadges();

    function getActiveShortcutContainer() {
        if (aiToolsCheckbox?.checked && aiToolsCont?.dataset.open === "true") return toolsCont;
        if (shortcutsCheckbox?.checked && shortcutsSection?.style.display !== "none") return shortcutsContainer;
        return null;
    }

    // Alt + 1-9 (or Alt + Shift + 1-9) to open corresponding shortcut or AI tool
    document.addEventListener("keydown", (e) => {
        const isAltGraph = e.getModifierState?.("AltGraph");
        if ((!e.altKey && !isAltGraph) || (e.ctrlKey && !isAltGraph) || e.metaKey || (isAltGraph && e.shiftKey)) return;

        let num = parseInt(e.key);
        if (isNaN(num) || num < 1 || num > 9) {
            const match = /^Digit([1-9])$/.exec(e.code);
            if (match) num = Number(match[1]);
        }
        if (isNaN(num) || num < 1 || num > 9) return;

        const container = getActiveShortcutContainer();
        if (!container) return;

        const links = container === toolsCont
            ? [...toolsCont.querySelectorAll("a")].filter(link => link.style.display !== "none")
            : shortcutsContainer.querySelectorAll(".shortcuts a");
        const link = links[num - 1];

        if (link?.href) {
            e.preventDefault();
            window.location.href = link.href;
        }
    });

    let altHoldTimer;
    const isAltModifierKey = (e) => e.key === "Alt" || e.key === "AltGraph";

    function getAltBadgeTargets() {
        const targets = [];
        const activeContainer = getActiveShortcutContainer();
        if (activeContainer) targets.push(activeContainer);
        Object.values(COMMAND_TARGETS).forEach(({ el, isEnabled }) => {
            if (el?.dataset.shortcut && isEnabled()) targets.push(el);
        });
        return targets;
    }

    function hideShortcutNumbers() {
        clearTimeout(altHoldTimer);
        [shortcutsContainer, toolsCont, ...Object.values(COMMAND_TARGETS).map(t => t.el)]
            .forEach(el => el?.classList.remove("show-shortcut-numbers"));
    }

    document.addEventListener("keydown", (e) => {
        if (!isAltModifierKey(e) || e.repeat) return;
        syncCommandBadges();
        altHoldTimer = setTimeout(() => {
            getAltBadgeTargets().forEach(el => el.classList.add("show-shortcut-numbers"));
        }, 300);
    });

    document.addEventListener("keyup", (e) => {
        if (isAltModifierKey(e)) hideShortcutNumbers();
    });

    window.addEventListener("blur", hideShortcutNumbers);

    // Handle extension commands routed to the active New Tab page
    const commandByAction = Object.fromEntries(
        Object.values(COMMAND_TARGETS).map(target => [target.action, target])
    );

    globalThis.chrome?.runtime?.onMessage?.addListener((message) => {
        const target = commandByAction[message.action];
        if (!target) return;

        chrome.tabs?.getCurrent?.((tab) => {
            if (tab?.id !== message.tabId || !target.isEnabled()) return;

            const promptModal = document.getElementById("prompt-modal-container");
            const aiModal = document.getElementById("aiToolsSettingsModal");
            const bookmarkModal = document.getElementById("editBookmarkModal");
            const isSubModalOpen =
                promptModal?.style.display === "flex" ||
                aiModal?.style.display === "block" ||
                bookmarkModal?.style.display === "block";

            if (isSubModalOpen) return;
            if (message.action !== "toggle-settings" && menuBar.style.display !== "none") return;

            target.el?.click();
        });
    });
});
