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
 *
 *   Markup:   <select id="x" data-custom-select> ... </select>      (picked up automatically)
 *   Script:   initCustomSelect(selectElement)                       (for selects you create later)
 *             refreshCustomSelect(selectElement)                    (only if you change options in an unusual way)
 *             destroyCustomSelect(selectElement)                    (puts the native select back)
 *
 * The native <select> stays in the DOM (hidden) and remains the source of truth, so existing code keeps working
 * unchanged: select.value = ..., select.selectedIndex, select.selectedOptions, select.disabled, select.focus(),
 * replaceChildren() on the options and the "change" event all behave as before.
 * The trigger copies the select's classes, so existing CSS such as .languageSelector still styles it.
 */
(function () {
    const CHEVRON = '<svg class="cs-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>';
    const CHECK = '<svg class="cs-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
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

        // ---- Elements ----
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

        // The trigger goes BEFORE the select so "select + label" CSS (floating labels) keeps working.
        select.before(trigger);
        document.body.appendChild(menu);
        const previousDisplay = select.style.display;
        select.style.display = "none";
        select.setAttribute("aria-hidden", "true");
        select.tabIndex = -1;

        // ---- Rendering ----
        function sync() {
            const option = select.options[select.selectedIndex];
            // Indentation (em-spaces for nested folders) only makes sense inside the list
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
                item.className = "cs-option";
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

        // ---- Open / close ----
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

        // Next enabled option from `from` in direction `dir` (stays put at the ends)
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

        // ---- Events ----
        trigger.addEventListener("click", () => (isOpen ? closeMenu() : openMenu()));

        trigger.addEventListener("keydown", event => {
            // Keys typed here (arrows, letters, Escape...) must not reach the page's shortcuts
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
                case "Tab": // commit the highlighted option, then let Tab move focus on as usual
                    if (active >= 0) choose(active);
                    closeMenu(); // choose() ignores a disabled option and would leave the menu open
                    break;
                default: if (isCharacter) typeahead(key);
            }
        });

        menu.addEventListener("mousedown", event => event.preventDefault()); // keep focus on the trigger
        menu.addEventListener("click", event => {
            // The popup lives on <body>, outside any modal/panel, so page-level "click outside to close"
            // handlers (edit bookmark modal, sidebar, settings...) would treat a pick as an outside click.
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

        // ---- Keep in sync with code that talks to the native select ----
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
        const observer = new MutationObserver(sync); // options replaced / renamed, disabled toggled
        observer.observe(select, {
            childList: true, subtree: true, characterData: true,
            attributes: true, attributeFilter: ["disabled"]
        });

        function destroy() {
            closeMenu();
            observer.disconnect();
            select.removeEventListener("change", sync);
            delete select.value;
            delete select.selectedIndex;
            delete select.focus;
            trigger.remove();
            menu.remove();
            select.style.display = previousDisplay;
            select.removeAttribute("aria-hidden");
            select.removeAttribute("tabindex");
            delete select._customSelect;
        }

        sync();
        select._customSelect = { trigger, menu, refresh: sync, open: openMenu, close: closeMenu, destroy };
        return select._customSelect;
    }

    function initCustomSelects(root = document) {
        root.querySelectorAll("select[data-custom-select]").forEach(initCustomSelect);
    }

    window.initCustomSelect = initCustomSelect;
    window.initCustomSelects = initCustomSelects;
    window.refreshCustomSelect = select => select && select._customSelect && select._customSelect.refresh();
    window.destroyCustomSelect = select => select && select._customSelect && select._customSelect.destroy();

    if (document.readyState === "complete") initCustomSelects();
    else document.addEventListener("DOMContentLoaded", () => initCustomSelects());
})();