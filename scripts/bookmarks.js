/* 
 * Material You NewTab
 * Copyright (c) 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program. 
 * If not, see <https://www.gnu.org/licenses/>.
 */

// DOM Variables
const bookmarkButton = document.getElementById("bookmarkButton");
const bookmarkSidebar = document.getElementById("bookmarkSidebar");
const bookmarkList = document.getElementById("bookmarkList");
const bookmarkSearch = document.getElementById("bookmarkSearch");
const bookmarkSearchClearButton = document.getElementById("clearSearchButton");
const bookmarkViewGrid = document.getElementById("bookmarkViewGrid");
const bookmarkViewList = document.getElementById("bookmarkViewList");
const bookmarksCheckbox = document.getElementById("bookmarksCheckbox");
const editBookmarkModal = document.getElementById("editBookmarkModal");
const editBookmarkName = document.getElementById("editBookmarkName");
const editBookmarkURL = document.getElementById("editBookmarkURL");
const editBookmarkFavicon = document.getElementById("editBookmarkFavicon");
const saveBookmarkChanges = document.getElementById("saveBookmarkChanges");
const cancelBookmarkEdit = document.getElementById("cancelBookmarkEdit");
const editBookmarkFolder = document.getElementById("editBookmarkFolder");
const newBookmarkFolderButton = document.getElementById("newBookmarkFolderButton");
const newBookmarkFolderRow = document.getElementById("newBookmarkFolderRow");
const newBookmarkFolderName = document.getElementById("newBookmarkFolderName");
const createBookmarkFolderButton = document.getElementById("createBookmarkFolder");
const cancelBookmarkFolderButton = document.getElementById("cancelBookmarkFolder");
const newBookmarkFolderHint = document.getElementById("newBookmarkFolderHint");
let currentBookmarkId = null;
let editBookmarkOriginalParentId = null; // folder the edited bookmark was in when the modal opened
let bookmarkFolderLoadToken = 0; // guards against overlapping folder list loads

const bookmarkSortButtons = Array.from(document.querySelectorAll(".bookmark-sort-button"));
const BOOKMARK_SORT_METHODS = ["default", "title", "title-desc", "date", "date-desc"]; // Browser order, A-Z, Z-A, Old-New, New-Old
let currentSortMethod = localStorage.getItem("bookmarkSortMethod");
if (!BOOKMARK_SORT_METHODS.includes(currentSortMethod)) currentSortMethod = "default"; // first load: browser order

var bookmarksAPI;
if (isFirefox) {
    bookmarksAPI = browser.bookmarks;
} else if (isChromiumBased) {
    bookmarksAPI = chrome.bookmarks;
}

updateSortButtons();

// ------------------------ Options menu, favorites & per-bookmark menu -----------------------------------
const bookmarkMenuButton = document.getElementById("bookmarkMenuButton");
const bookmarkMenu = document.getElementById("bookmarkMenu");
const bookmarkMenuDisplay = document.getElementById("bookmarkMenuDisplay");
const bookmarkDisplaySub = document.getElementById("bookmarkDisplaySub");
const bookmarkMenuAdd = document.getElementById("bookmarkMenuAdd");
const bookmarkShowRecent = document.getElementById("bookmarkShowRecent");
const bookmarkShowFavorites = document.getElementById("bookmarkShowFavorites");
const bookmarkRecentCountRow = document.getElementById("bookmarkRecentCountRow");
const bookmarkRecentCountEls = document.querySelectorAll(".bm-recent-count");
const bookmarkRecentMinusEls = document.querySelectorAll(".bm-recent-minus");
const bookmarkRecentPlusEls = document.querySelectorAll(".bm-recent-plus");
const bookmarkItemMenu = document.getElementById("bookmarkItemMenu");
const bookmarkRecentMenu = document.getElementById("bookmarkRecentMenu");
const bookmarkFavoritesMenu = document.getElementById("bookmarkFavoritesMenu");
const bookmarkFavoriteActionLabel = document.getElementById("bookmarkFavoriteActionLabel");

const FAVORITES_KEY = "bookmarkFavorites"; // JSON array of bookmark ids
const SHOW_RECENT_KEY = "bookmarkShowRecentCheckboxState";
const SHOW_FAVORITES_KEY = "bookmarkShowFavoritesCheckboxState";
const RECENT_COUNT_KEY = "bookmarkRecentCount";
const RECENT_COUNT_DEFAULT = 8;
const RECENT_COUNT_MIN = 1;
const RECENT_COUNT_MAX = 20;

let bookmarkItemMenuNode = null; // bookmark / folder node the item menu is open for
let bookmarkItemMenuAnchor = null; // the three-dots button that opened it (item menu or Recent menu)
let bookmarkItemMenuContext = {}; // { inFavorites, index, total } of the row the menu was opened from
let bookmarkRootId = null; // id of the invisible root; its children are the top folders (Bookmarks bar, Other bookmarks, ...)
let bookmarkModalMode = "edit"; // "edit" | "add"
let bookmarkLoadToken = 0; // guards against overlapping loadBookmarks() calls
let bookmarkMenuIgnoreScrollUntil = 0; // re-rendering resets the scroll position; don't treat that as a user scroll
let bookmarkVisibleFavoriteIds = []; // ids of the favorites currently shown, in display order
const bookmarkCollapsedFolders = new Set(); // "section/folderId" keys of folders the user collapsed
const bookmarkNodeMap = new Map(); // id -> node of the rendered rows (the delegated click handler looks nodes up here)
const bookmarkCollapsedSections = new Set(); // "favorites" | "recent" | "folders" sections the user collapsed

// Icons live in one <svg> sprite in index.html (#bmi-<name>)
function bmIcon(name, extraClass = "") {
    return `<svg class="bm-icon ${extraClass}" viewBox="0 0 52 52" aria-hidden="true"><use href="#bmi-${name}"></use></svg>`;
}

// URL as shown under the name: only http:// and https:// are dropped (chrome://, about:, file:// etc. and www. stay), plus a trailing slash
function bmPrettyUrl(url) {
    return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function bmHost(url) {
    try {
        return new URL(url).hostname.replace(/^www\./i, "") || url;
    } catch {
        return url;
    }
}

function getRecentCount() {
    const n = parseInt(localStorage.getItem(RECENT_COUNT_KEY), 10);
    if (!Number.isFinite(n)) return RECENT_COUNT_DEFAULT;
    return Math.min(RECENT_COUNT_MAX, Math.max(RECENT_COUNT_MIN, n));
}

// ---- Favorites (stored by bookmark id) ----
function getFavoriteIds() {
    try {
        const ids = JSON.parse(localStorage.getItem(FAVORITES_KEY));
        return Array.isArray(ids) ? ids.map(String) : [];
    } catch {
        return [];
    }
}

function saveFavoriteIds(ids) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...new Set(ids.map(String))]));
}

function isFavorite(id) {
    return getFavoriteIds().includes(String(id));
}

function toggleFavorite(id) {
    const ids = getFavoriteIds();
    const strId = String(id);
    saveFavoriteIds(ids.includes(strId) ? ids.filter(x => x !== strId) : [...ids, strId]);
}

// Finds the favorites (bookmarks and folders) in the tree, in the saved order;
// also drops ids whose bookmark / folder no longer exists
function collectFavoriteNodes(rootNodes) {
    const ids = getFavoriteIds();
    if (!ids.length) return [];

    const wanted = new Set(ids);
    const found = new Map();
    const walk = nodes => nodes.forEach(n => {
        if (wanted.has(String(n.id)) && (n.url || n.children)) found.set(String(n.id), n);
        if (n.children) walk(n.children);
    });
    walk(rootNodes);

    if (found.size !== ids.length) {
        saveFavoriteIds(ids.filter(id => found.has(id)));
    }
    return ids.filter(id => found.has(id)).map(id => found.get(id));
}

// Moves a favorite one step up (-1) or down (+1) among the favorites that are shown
function moveFavorite(id, delta) {
    const visible = [...bookmarkVisibleFavoriteIds];
    const from = visible.indexOf(String(id));
    const to = from + delta;
    if (from < 0 || to < 0 || to >= visible.length) return;
    [visible[from], visible[to]] = [visible[to], visible[from]];

    // Put the shown ids back into the slots they occupied (hidden ones, e.g. empty folders, keep their place)
    const slots = new Set(bookmarkVisibleFavoriteIds);
    let next = 0;
    saveFavoriteIds(getFavoriteIds().map(x => (slots.has(x) ? visible[next++] : x)));
}

// ---- Menu helpers ----
function closeBookmarkMenu() {
    bookmarkMenu.classList.remove("open");
    bookmarkMenuButton.setAttribute("aria-expanded", "false");
}

function closeBookmarkItemMenu() {
    bookmarkItemMenu.classList.remove("open");
    bookmarkRecentMenu.classList.remove("open");
    bookmarkFavoritesMenu.classList.remove("open");
    bookmarkItemMenuAnchor?.classList.remove("active");
    bookmarkItemMenuAnchor = null;
    bookmarkItemMenuNode = null;
    bookmarkItemMenuContext = {};
}

function closeBookmarkMenus() {
    closeBookmarkMenu();
    closeBookmarkItemMenu();
}

// ---- Keyboard support for the menus (WAI-ARIA menu pattern) ----
// Opening focuses the first item; Up / Down / Home / End move between items; Escape and Tab close the menu
// and return focus to its button.
const bookmarkAllMenus = [bookmarkMenu, bookmarkItemMenu, bookmarkRecentMenu, bookmarkFavoritesMenu];

// Everything in a menu that can take focus and is visible (the Display panel only counts while it is open)
function getBookmarkMenuItems(menu) {
    return Array.from(menu.querySelectorAll('button, input[type="checkbox"]'))
        .filter(el => !el.disabled && !el.hidden && el.offsetParent !== null
            && !el.closest(".bookmark-menu-sub:not(.open)")); // the collapsed Display panel stays in the layout
}

function focusBookmarkMenuItem(menu) {
    getBookmarkMenuItems(menu)[0]?.focus({ preventScroll: true });
}

function closeBookmarkMenusAndRestoreFocus() {
    const target = bookmarkMenu.classList.contains("open") ? bookmarkMenuButton : bookmarkItemMenuAnchor;
    closeBookmarkMenus();
    if (target?.isConnected) target.focus({ preventScroll: true });
}

bookmarkAllMenus.forEach(menu => menu.addEventListener("keydown", function (event) {
    const items = getBookmarkMenuItems(menu);
    const index = items.indexOf(document.activeElement);
    let next;
    switch (event.key) {
        case "ArrowDown": next = items[(index + 1) % items.length]; break;
        case "ArrowUp": next = items[(index - 1 + items.length) % items.length]; break;
        case "Home": next = items[0]; break;
        case "End": next = items[items.length - 1]; break;
        case "Escape":
            event.preventDefault();
            event.stopPropagation();
            closeBookmarkMenusAndRestoreFocus();
            return;
        case "Tab": // focus goes back to the button first, so Tab continues from there
            closeBookmarkMenusAndRestoreFocus();
            return;
        case "ArrowLeft":
        case "ArrowRight": // keep the page's ArrowRight shortcut (toggle the sidebar) from firing inside a menu
            event.stopPropagation();
            return;
        default:
            return;
    }
    event.preventDefault();
    event.stopPropagation();
    next?.focus({ preventScroll: true });
}));

function updateRecentCountUI() {
    const count = getRecentCount();
    bookmarkRecentCountEls.forEach(el => { el.textContent = localizeNumbers(String(count), currentLanguage); });
    // While Recent is hidden the whole stepper is disabled (a disabled button is also skipped by the keyboard).
    const recentShown = bookmarkShowRecent.checked;
    bookmarkRecentMinusEls.forEach(button => { button.disabled = !recentShown || count <= RECENT_COUNT_MIN; });
    bookmarkRecentPlusEls.forEach(button => { button.disabled = !recentShown || count >= RECENT_COUNT_MAX; });
    bookmarkRecentCountRow.classList.toggle("disabled", !recentShown);
}

function syncBookmarkMenuState() {
    loadCheckboxState(SHOW_RECENT_KEY, bookmarkShowRecent, true);
    loadCheckboxState(SHOW_FAVORITES_KEY, bookmarkShowFavorites, true);
    updateRecentCountUI();
}

bookmarkMenuButton.addEventListener("click", function (event) {
    event.stopPropagation();
    closeBookmarkItemMenu();
    const isOpen = bookmarkMenu.classList.toggle("open");
    bookmarkMenuButton.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) {
        if (!bookmarkDisplaySub.classList.contains("open")) bookmarkMenuDisplay.click();
        focusBookmarkMenuItem(bookmarkMenu);
    }
});

// The Display panel animates its height with its content clipped; once fully open the clip is
// lifted ("settled") so the button tooltips are not cut off.
bookmarkMenuDisplay.addEventListener("click", function () {
    const isOpen = bookmarkDisplaySub.classList.toggle("open");
    bookmarkMenuDisplay.setAttribute("aria-expanded", String(isOpen));
    if (!isOpen) bookmarkDisplaySub.classList.remove("settled");
    else if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) bookmarkDisplaySub.classList.add("settled");
});

bookmarkDisplaySub.addEventListener("transitionend", function (event) {
    if (event.target !== bookmarkDisplaySub || event.propertyName !== "grid-template-rows") return;
    bookmarkDisplaySub.classList.toggle("settled", bookmarkDisplaySub.classList.contains("open"));
});

bookmarkMenuAdd.addEventListener("click", function () {
    closeBookmarkMenu();
    openBookmarkModal("add");
});

bookmarkShowRecent.addEventListener("change", function () {
    saveCheckboxState(SHOW_RECENT_KEY, bookmarkShowRecent);
    updateRecentCountUI();
    loadBookmarks();
});

bookmarkShowFavorites.addEventListener("change", function () {
    saveCheckboxState(SHOW_FAVORITES_KEY, bookmarkShowFavorites);
    loadBookmarks();
});

function setRecentCount(count) {
    if (!bookmarkShowRecent.checked) return; // the count cannot change while Recent is hidden
    const clamped = Math.min(RECENT_COUNT_MAX, Math.max(RECENT_COUNT_MIN, count));
    localStorage.setItem(RECENT_COUNT_KEY, clamped);
    updateRecentCountUI();
    loadBookmarks();
}

bookmarkRecentMinusEls.forEach(button => button.addEventListener("click", () => setRecentCount(getRecentCount() - 1)));
bookmarkRecentPlusEls.forEach(button => button.addEventListener("click", () => setRecentCount(getRecentCount() + 1)));

// Close menus when clicking elsewhere (capture phase, so it runs before any row handler)
document.addEventListener("click", function (event) {
    if (!bookmarkMenu.contains(event.target) && !bookmarkMenuButton.contains(event.target)) {
        closeBookmarkMenu();
    }
    const insideItemMenus = bookmarkItemMenu.contains(event.target) || bookmarkRecentMenu.contains(event.target) ||
        bookmarkFavoritesMenu.contains(event.target);
    if (!insideItemMenus && !event.target.closest(".bookmark-more-button")) {
        closeBookmarkItemMenu();
    }
}, true);

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" &&
        (bookmarkMenu.classList.contains("open") ||
            bookmarkItemMenu.classList.contains("open") ||
            bookmarkRecentMenu.classList.contains("open") ||
            bookmarkFavoritesMenu.classList.contains("open"))) {
        closeBookmarkMenusAndRestoreFocus();
        event.stopPropagation();
        return;
    }

    // Escape also closes the sidebar (on narrow windows it covers the screen and its button is off-screen)
    const promptModal = document.getElementById("prompt-modal-container");
    if (event.key === "Escape" && bookmarkSidebar.classList.contains("open") &&
        editBookmarkModal.style.display !== "block" && promptModal?.style.display !== "flex" &&
        menuBar.style.display === "none") {
        toggleBookmarkSidebar();
    }
});

bookmarkList.addEventListener("scroll", function () {
    if (performance.now() < bookmarkMenuIgnoreScrollUntil) return;
    closeBookmarkItemMenu();
}, { passive: true });

// ---- Three-dots menus ----
// Places a menu under its button (right edges aligned); flips above when there is no room
function positionBookmarkMenu(menu, button) {
    const sidebarRect = bookmarkSidebar.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const menuWidth = menu.offsetWidth;
    const menuHeight = menu.offsetHeight;

    let left = buttonRect.right - sidebarRect.left - menuWidth;
    left = Math.max(8, Math.min(left, sidebarRect.width - menuWidth - 8));

    let top = buttonRect.bottom - sidebarRect.top + 4;
    const above = top + menuHeight > sidebarRect.height - 8;
    if (above) top = buttonRect.top - sidebarRect.top - menuHeight - 4;
    menu.classList.toggle("above", above); // decides which corner the open animation grows from

    menu.style.left = left + "px";
    menu.style.top = Math.max(8, top) + "px";
}

// Bookmark / folder menu. context = { inFavorites, index, total } when the row is in the Favorites section
function openBookmarkItemMenu(button, node, context = {}) {
    // Clicking the same button again closes the menu
    if (bookmarkItemMenuAnchor === button) {
        closeBookmarkItemMenu();
        return;
    }
    closeBookmarkMenu();
    closeBookmarkItemMenu();

    bookmarkItemMenuNode = node;
    bookmarkItemMenuContext = context;
    bookmarkItemMenuAnchor = button;
    button.classList.add("active");

    const favorite = isFavorite(node.id);
    bookmarkItemMenu.classList.toggle("is-favorite", favorite);
    bookmarkItemMenu.classList.toggle("is-folder", !node.url);
    bookmarkItemMenu.classList.toggle("in-favorites", Boolean(context.inFavorites));
    bookmarkFavoriteActionLabel.textContent = getTranslation(favorite ? "removeFromFavorite" : "addToFavorite");

    bookmarkItemMenu.querySelector('[data-action="moveUp"]').disabled = !context.inFavorites || context.index <= 0;
    bookmarkItemMenu.querySelector('[data-action="moveDown"]').disabled =
        !context.inFavorites || context.index >= context.total - 1;

    // Shortcuts are plain links, which can't open chrome://, mailto:, javascript: etc. (only http / https)
    bookmarkItemMenu.querySelector('[data-action="shortcut"]').disabled = !/^https?:\/\//i.test(node.url || "");

    // Folder actions: new bookmarks can't go into read-only folders, and top folders can't be deleted
    bookmarkItemMenu.querySelector('[data-action="addHere"]').disabled = Boolean(node.unmodifiable);
    bookmarkItemMenu.querySelector('[data-action="deleteFolder"]').disabled = !node.url && !canDeleteBookmarkFolder(node);

    bookmarkItemMenu.classList.add("open");
    positionBookmarkMenu(bookmarkItemMenu, button);
    focusBookmarkMenuItem(bookmarkItemMenu);
}

bookmarkItemMenu.addEventListener("click", async function (event) {
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton || actionButton.disabled) return;
    event.stopPropagation();

    const node = bookmarkItemMenuNode;
    closeBookmarkItemMenu();
    if (!node) return;

    switch (actionButton.dataset.action) {
        case "favorite":
            toggleFavorite(node.id);
            loadBookmarks();
            break;
        case "moveUp":
            moveFavorite(node.id, -1);
            loadBookmarks();
            break;
        case "moveDown":
            moveFavorite(node.id, 1);
            loadBookmarks();
            break;
        case "shortcut":
            addBookmarkToShortcuts(node);
            break;
        case "edit":
            openBookmarkModal("edit", node);
            break;
        case "delete":
            await deleteBookmarkNode(node);
            break;
        case "addHere": // "Add bookmark" in a folder's menu: the modal opens with this folder selected
            openBookmarkModal("add", null, node.id);
            break;
        case "deleteFolder":
            await deleteBookmarkFolder(node);
            break;
    }
});

// "Recent" header menu: hide the section, change how many are shown
function openRecentMenu(button) {
    if (bookmarkItemMenuAnchor === button) {
        closeBookmarkItemMenu();
        return;
    }
    closeBookmarkMenu();
    closeBookmarkItemMenu();

    bookmarkItemMenuAnchor = button;
    button.classList.add("active");
    updateRecentCountUI();
    bookmarkRecentMenu.classList.add("open");
    positionBookmarkMenu(bookmarkRecentMenu, button);
    focusBookmarkMenuItem(bookmarkRecentMenu);
}

bookmarkRecentMenu.addEventListener("click", function (event) {
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;
    event.stopPropagation();

    if (actionButton.dataset.action === "hideRecent") {
        closeBookmarkItemMenu();
        bookmarkShowRecent.checked = false;
        saveCheckboxState(SHOW_RECENT_KEY, bookmarkShowRecent);
        updateRecentCountUI();
        loadBookmarks();
    }
});

// "Favorites" header menu: hide the section (it can be turned back on in the options menu)
function openFavoritesMenu(button) {
    if (bookmarkItemMenuAnchor === button) {
        closeBookmarkItemMenu();
        return;
    }
    closeBookmarkMenu();
    closeBookmarkItemMenu();

    bookmarkItemMenuAnchor = button;
    button.classList.add("active");
    bookmarkFavoritesMenu.classList.add("open");
    positionBookmarkMenu(bookmarkFavoritesMenu, button);
    focusBookmarkMenuItem(bookmarkFavoritesMenu);
}

bookmarkFavoritesMenu.addEventListener("click", function (event) {
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;
    event.stopPropagation();

    if (actionButton.dataset.action === "hideFavorites") {
        closeBookmarkItemMenu();
        bookmarkShowFavorites.checked = false;
        saveCheckboxState(SHOW_FAVORITES_KEY, bookmarkShowFavorites);
        loadBookmarks();
    }
});

function addBookmarkToShortcuts(node) {
    globalThis.addNewShortcut(node.title || bmHost(node.url), node.url);
}

// ---- Bookmarks API wrapper (Firefox: promises, Chromium: callbacks) ----
function bookmarksCall(method, ...args) {
    if (isFirefox) return bookmarksAPI[method](...args);
    return new Promise((resolve, reject) => {
        bookmarksAPI[method](...args, result => {
            if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
            else resolve(result);
        });
    });
}

async function deleteBookmarkNode(node) {
    const confirmMessage = (translations[currentLanguage]?.deleteBookmark || translations["en"].deleteBookmark)
        .replace("{title}", node.title || node.url);

    if (!(await confirmPrompt(confirmMessage))) return;

    try {
        await bookmarksCall("remove", node.id);
        saveFavoriteIds(getFavoriteIds().filter(id => id !== String(node.id)));
        loadBookmarks(); // re-render: the bookmark may appear in Favorites / Recent / its folder
    } catch (err) {
        console.error("Error removing bookmark:", err);
    }
}

// Top folders (Bookmarks bar, Other bookmarks, Mobile bookmarks...) and read-only folders can't be deleted
function canDeleteBookmarkFolder(node) {
    if (node.url || node.unmodifiable || node.parentId == null) return false;
    return bookmarkRootId === null || String(node.parentId) !== bookmarkRootId;
}

// Every node below a folder (bookmarks and sub-folders), flattened
function collectBookmarkDescendants(folder) {
    const nodes = [];
    const walk = children => (children || []).forEach(child => {
        nodes.push(child);
        if (child.children) walk(child.children);
    });
    walk(folder.children);
    return nodes;
}

// Deletes a sub-folder together with everything inside it
async function deleteBookmarkFolder(folder) {
    if (!canDeleteBookmarkFolder(folder)) return;

    const descendants = collectBookmarkDescendants(folder);
    const count = descendants.filter(node => node.url).length;
    const message = getTranslation("deleteBookmarkFolder").replace("{title}", folder.title || getTranslation("untitledFolder")).replace("{count}", localizeNumbers(String(count), currentLanguage));

    if (!(await confirmPrompt(message))) return;

    try {
        await bookmarksCall("removeTree", folder.id);
        const removedIds = new Set([folder, ...descendants].map(node => String(node.id)));
        saveFavoriteIds(getFavoriteIds().filter(id => !removedIds.has(id)));
        loadBookmarks();
    } catch (err) {
        console.error("Error removing folder:", err);
    }
}

// Finds the folder new bookmarks go to (the bookmarks bar / toolbar)
function findDefaultBookmarkFolder(rootChildren) {
    const folders = rootChildren.filter(node => node.children);
    return (
        // 1. The browser labels it itself (Chrome 134+ and Chromium browsers: folderType)
        folders.find(node => node.folderType === "bookmarks-bar") ||
        // 2. Firefox's fixed id of the bookmarks toolbar
        folders.find(node => node.id === "toolbar_____") ||
        // 3. Chromium's fixed id of the bookmarks bar
        folders.find(node => node.id === "1") ||
        // 4. Otherwise the first folder that can be written to (the bar is first in the other browsers)
        folders.find(node => !node.unmodifiable)
    );
}

// ---- Add / edit modal (shared) ----
// Grey globe shown in the modal until a valid URL is known (fixed colour: an <img> cannot inherit currentColor)
const BOOKMARK_UNKNOWN_ICON = "data:image/svg+xml," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#566170" d="M12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12q0-.175-.012-.363t-.013-.312q-.125.725-.675 1.2T18 13h-2q-.825 0-1.412-.587T14 11v-1h-4V8q0-.825.588-1.412T12 6h1q0-.575.313-1.012t.762-.713q-.5-.125-1.012-.2T12 4Q8.65 4 6.325 6.325T4 12h5q1.65 0 2.825 1.175T13 16v1h-3v2.75q.5.125.988.188T12 20"/></svg>');

// folderId (add mode only): folder to preselect instead of the default one
function openBookmarkModal(mode, node, folderId = null) {
    bookmarkModalMode = mode;
    const heading = document.getElementById("editBookmarkHeading");

    // Keep the original "Edit" heading so it can be restored
    if (mode === "add") {
        if (heading.dataset.editText === undefined) heading.dataset.editText = heading.textContent;
        heading.textContent = getTranslation("addBookmarkHeading");
    } else if (heading.dataset.editText !== undefined) {
        heading.textContent = heading.dataset.editText;
        delete heading.dataset.editText;
    }

    if (mode === "add") {
        currentBookmarkId = null;
        editBookmarkName.value = "";
        editBookmarkURL.value = "";
        showUnknownModalIcon();
        saveBookmarkChanges.disabled = true;
    } else {
        currentBookmarkId = node.id;
        editBookmarkName.value = node.title || "";
        editBookmarkURL.value = node.url || "";
        updateModalFavicon();
        saveBookmarkChanges.disabled = false;
    }

    // Folder picker: default folder when adding, current folder when editing
    const folderToken = ++bookmarkFolderLoadToken;
    hideNewBookmarkFolderRow();
    editBookmarkOriginalParentId = mode === "edit" && node.parentId ? String(node.parentId) : null;
    if (mode === "add") {
        populateBookmarkFolderSelect(folderId, null, folderToken);
    } else {
        loadEditBookmarkFolder(node, folderToken);
    }

    editBookmarkModal.style.display = "block";
    editBookmarkName.focus();
}

// ---- Folder picker (Add / Edit modal) ----
// Lists the folders a bookmark can go in, indented by depth. Read-only folders (e.g. managed) and the
// invisible root are left out; keepId keeps the bookmark's current folder in the list.
function collectBookmarkFolderOptions(rootChildren, keepId) {
    const options = [];
    const walk = (nodes, depth, blocked) => nodes.forEach(node => {
        if (!node.children) return; // a bookmark, not a folder
        const readOnly = blocked || Boolean(node.unmodifiable);
        const isKept = keepId != null && String(node.id) === String(keepId);
        if (!readOnly || isKept) options.push({ id: String(node.id), title: node.title, depth, readOnly });
        walk(node.children, depth + 1, readOnly);
    });
    walk(rootChildren, 0, false);
    return options;
}

async function populateBookmarkFolderSelect(selectedId, keepId, token = ++bookmarkFolderLoadToken) {
    editBookmarkFolder.disabled = true;
    try {
        const tree = await bookmarksCall("getTree");
        if (token !== bookmarkFolderLoadToken) return; // the modal was reopened meanwhile

        const rootChildren = tree[0]?.children || [];
        const options = collectBookmarkFolderOptions(rootChildren, keepId);

        editBookmarkFolder.replaceChildren(...options.map(option => {
            const element = document.createElement("option");
            element.value = option.id;
            const name = option.title || getTranslation("untitledFolder");
            element.textContent = "\u2003".repeat(option.depth) + name + (option.readOnly ? " 🔒" : "");
            element.title = name;
            return element;
        }));

        const defaultId = findDefaultBookmarkFolder(rootChildren)?.id;
        const candidates = [selectedId, defaultId, options[0]?.id].map(id => (id == null ? null : String(id)));
        const chosen = candidates.find(id => id !== null && options.some(option => option.id === id));
        if (chosen) editBookmarkFolder.value = chosen;
    } catch (err) {
        console.warn("Unable to load bookmark folders:", err);
    } finally {
        if (token === bookmarkFolderLoadToken) editBookmarkFolder.disabled = false;
    }
}

async function loadEditBookmarkFolder(node, token) {
    let parentId = node.parentId;
    if (!parentId) { // e.g. opened from a context menu without the full node
        try {
            const [fullNode] = await bookmarksCall("get", node.id);
            parentId = fullNode?.parentId;
        } catch (err) {
            console.warn("Unable to read the bookmark's folder:", err);
        }
    }
    if (token !== bookmarkFolderLoadToken) return;
    editBookmarkOriginalParentId = parentId ? String(parentId) : null;
    await populateBookmarkFolderSelect(editBookmarkOriginalParentId, editBookmarkOriginalParentId, token);
}

// "New folder" is created inside the folder currently selected (select a parent first for a sub-folder)
function updateNewBookmarkFolderHint() {
    const selected = editBookmarkFolder.selectedOptions[0];
    const parentName = selected ? selected.title : "";
    newBookmarkFolderHint.textContent = `${getTranslation("newFolderIn")}: ${parentName}`;
}

// Like the Display panel: once fully open, the clip is lifted so the button tooltips are not cut off
newBookmarkFolderRow.addEventListener("transitionend", function (event) {
    if (event.target !== newBookmarkFolderRow || event.propertyName !== "grid-template-rows") return;
    newBookmarkFolderRow.classList.toggle("settled", newBookmarkFolderRow.classList.contains("open"));
});

function showNewBookmarkFolderRow() {
    newBookmarkFolderRow.classList.add("open");
    if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) newBookmarkFolderRow.classList.add("settled");
    newBookmarkFolderButton.setAttribute("aria-expanded", "true");
    newBookmarkFolderName.value = "";
    updateNewBookmarkFolderHint();
    newBookmarkFolderName.focus({ preventScroll: true });
}

function hideNewBookmarkFolderRow() {
    newBookmarkFolderRow.classList.remove("open", "settled");
    newBookmarkFolderButton.setAttribute("aria-expanded", "false");
    newBookmarkFolderName.value = "";
}

async function createBookmarkFolderFromModal() {
    const title = newBookmarkFolderName.value.trim();
    if (!title) {
        newBookmarkFolderName.focus();
        return;
    }

    const details = { title };
    if (editBookmarkFolder.value) details.parentId = editBookmarkFolder.value;

    try {
        const folder = await bookmarksCall("create", details);
        hideNewBookmarkFolderRow();
        // Reload the list and select the new folder
        await populateBookmarkFolderSelect(folder.id, editBookmarkOriginalParentId);
        editBookmarkFolder.focus();
    } catch (err) {
        console.error("Error creating folder:", err);
    }
}

newBookmarkFolderButton.addEventListener("click", showNewBookmarkFolderRow);
createBookmarkFolderButton.addEventListener("click", createBookmarkFolderFromModal);
cancelBookmarkFolderButton.addEventListener("click", function () {
    hideNewBookmarkFolderRow();
    newBookmarkFolderButton.focus();
});
editBookmarkFolder.addEventListener("change", updateNewBookmarkFolderHint);

newBookmarkFolderName.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        createBookmarkFolderFromModal();
    } else if (event.key === "Escape") {
        event.preventDefault();
        hideNewBookmarkFolderRow();
        newBookmarkFolderButton.focus();
    }
});

// Keys typed in the folder fields (arrows, letters, Escape...) must not reach the page's shortcuts
[editBookmarkFolder, newBookmarkFolderName].forEach(field =>
    field.addEventListener("keydown", event => event.stopPropagation()));

function normalizeBookmarkUrl(raw) {
    const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) || /^(about|mailto|data|javascript|view-source|file):/i.test(raw);
    return hasScheme ? raw : "https://" + raw;
}

// The address that is stored. new URL().href percent-encodes only what needs it (encodeURI would turn
// "a%20b" into "a%2520b"). null when it is not a valid URL.
function toBookmarkHref(url) {
    try {
        return new URL(url).href;
    } catch {
        return null;
    }
}

// The modal shows the site's icon, or "?" while the URL is blank or not valid (add and edit mode)
function showUnknownModalIcon() {
    editBookmarkFavicon.onerror = null;
    editBookmarkFavicon.src = BOOKMARK_UNKNOWN_ICON;
}

function updateModalFavicon() {
    const raw = editBookmarkURL.value.trim();
    if (!raw) {
        showUnknownModalIcon();
        return;
    }
    try {
        const url = normalizeBookmarkUrl(raw);
        new URL(url); // throws if invalid
        setBookmarkFavicon(editBookmarkFavicon, url);
    } catch {
        showUnknownModalIcon();
    }
}

// Clearing the field shows "?" at once; a typed URL gets its icon after typing pauses (or on blur), so no icon
// is requested for half-typed addresses.
let modalFaviconTimer = 0;
editBookmarkURL.addEventListener("input", function () {
    clearTimeout(modalFaviconTimer);
    if (!editBookmarkURL.value.trim()) showUnknownModalIcon();
    else modalFaviconTimer = setTimeout(updateModalFavicon, 500);
});
editBookmarkURL.addEventListener("change", function () {
    clearTimeout(modalFaviconTimer);
    updateModalFavicon();
});

// ------------------------ End of options menu section -----------------------------------

bookmarkButton.addEventListener("click", function () {
    toggleBookmarkSidebar();
    bookmarkSearchClearButton.click();
    bookmarkSearch.focus();
});

bookmarkViewGrid.addEventListener("click", function () {
    if (!bookmarkGridCheckbox.checked) bookmarkGridCheckbox.click();
});

bookmarkViewList.addEventListener("click", function () {
    if (bookmarkGridCheckbox.checked) bookmarkGridCheckbox.click();
});

document.addEventListener("click", function (event) {
    const modalContainer = document.getElementById("prompt-modal-container");
    // Ignore clicks while the modal is open or from inside it
    if (
        modalContainer?.style.display === "flex" ||
        modalContainer?.contains(event.target) ||
        event.composedPath().includes(modalContainer)
    ) {
        return;
    }

    if (
        !bookmarkSidebar.contains(event.target) &&
        !bookmarkButton.contains(event.target) &&
        !editBookmarkModal.contains(event.target) &&
        bookmarkSidebar.classList.contains("open")
    ) {
        toggleBookmarkSidebar();

        if (editBookmarkModal.style.display !== "none") {
            editBookmarkModal.style.display = "none";
        }
    }
});

// ---- Folder / section state ----
function setFolderOpen(folder, open) {
    folder.classList.toggle("open", open);
    folder.querySelector(":scope > .folder-row > .folder-toggle")?.setAttribute("aria-expanded", String(open));
    folder.querySelector(":scope > .folder-row > .bm-chevron-btn")?.setAttribute("aria-expanded", String(open));
}

function toggleFolder(folder) {
    const open = !folder.classList.contains("open");
    const animate = !globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!open) {
        // "closing" keeps the list displayed while it animates away
        if (animate) folder.classList.add("closing");
        scrollIntoPlace(folder);
    }
    setFolderOpen(folder, open);
    if (open) bookmarkCollapsedFolders.delete(folder.dataset.key);
    else bookmarkCollapsedFolders.add(folder.dataset.key);
    updateFoldersChevron();
    if (animate) animateList(folder, open);
}

// A scrolled-past folder's row is pinned (sticky) or scrolled out. Before collapsing it, scroll until its content
// starts where the row is pinned, so the list doesn't jump to whatever is left after the clamp.
function scrollIntoPlace(element) {
    const row = element.querySelector(":scope > .folder-row");
    const pinnedTop = row ? Number.parseFloat(getComputedStyle(row).top) || 0 : 0; // 0 / 56 / 112px by nesting level
    const offset = element.getBoundingClientRect().top - bookmarkList.getBoundingClientRect().top - pinnedTop;
    if (offset < -0.5) bookmarkList.scrollTo({ top: bookmarkList.scrollTop + offset, behavior: "instant" });
}

function measureList(list) {
    const style = getComputedStyle(list);
    return { height: style.height, paddingTop: style.paddingTop, paddingBottom: style.paddingBottom };
}

// Smooth open / close of a folder or section: the height (and padding) of its list animates between 0 and
// its natural size. overflow: clip (not hidden) keeps the list from becoming a scroll container, so the
// sticky rows of sub-folders keep pinning to #bookmarkList.
// `full` is the open size; pass it when the content changes before this runs (see toggleAllFolders).
function animateList(owner, open, full) {
    const list = owner.querySelector(":scope > ul");
    if (!list) return;
    list._folderAnimation?.cancel();
    full ??= measureList(list);
    const none = { height: "0px", paddingTop: "0px", paddingBottom: "0px" };
    list.style.overflow = "clip";
    const animation = list.animate(open ? [none, full] : [full, none], {
        duration: 300,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)" // --md-motion-ease
    });
    list._folderAnimation = animation;
    const finish = () => {
        if (list._folderAnimation !== animation) return; // a newer toggle took over
        list._folderAnimation = null;
        list.style.overflow = "";
        owner.classList.remove("closing");
    };
    animation.addEventListener("finish", finish);
    animation.addEventListener("cancel", finish);
}

// "folded" turns the chevron; "collapsed" hides the list. The Folders section is never hidden:
// its chevron folds / unfolds the folder tree instead (see toggleAllFolders)
function setSectionOpen(section, open) {
    section.classList.toggle("folded", !open);
    if (section.dataset.section !== "folders") section.classList.toggle("collapsed", !open);
    const expanded = String(open);
    section.querySelector(":scope > .bm-section-header .bm-chevron-btn")?.setAttribute("aria-expanded", expanded);
    section.querySelector(":scope > .bm-section-header .bm-section-toggle")?.setAttribute("aria-expanded", expanded);
}

function toggleSection(section) {
    const key = section.dataset.section;
    if (key === "folders") {
        toggleAllFolders(section);
        return;
    }
    const open = section.classList.contains("collapsed");
    const animate = !globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!open) {
        if (animate) section.classList.add("closing"); // keeps the list displayed while it animates away
        scrollIntoPlace(section);
    }
    setSectionOpen(section, open);
    if (open) bookmarkCollapsedSections.delete(key);
    else bookmarkCollapsedSections.add(key);
    if (animate) animateList(section, open);
}

// Folders chevron: if any folder is open, close every folder (only the main folders stay visible);
// if everything is closed, open every folder and sub-folder
function toggleAllFolders(section) {
    const expand = !hasOpenMainFolder(section);
    const animate = !globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Only the main folders animate; the sub-folders inside them change instantly (hidden by the clip)
    const changed = Array.from(section.querySelectorAll(":scope > ul > li.folder"))
        .filter(folder => folder.classList.contains("open") !== expand);
    // Closing: measure before the sub-folders collapse, so the animation starts from the size on screen
    const sizes = expand ? [] : changed.map(folder => measureList(folder.querySelector(":scope > ul")));
    if (!expand) {
        changed.forEach(folder => {
            if (animate) folder.classList.add("closing");
            scrollIntoPlace(folder);
        });
    }
    section.querySelectorAll("li.folder").forEach(folder => {
        setFolderOpen(folder, expand);
        if (expand) bookmarkCollapsedFolders.delete(folder.dataset.key);
        else bookmarkCollapsedFolders.add(folder.dataset.key);
    });
    updateFoldersChevron();
    if (animate) changed.forEach((folder, index) => animateList(folder, expand, sizes[index]));
}

// Only main (top-level) folders count: an open sub-folder inside a collapsed main folder is not visible, so it
// must not keep the chevron "open" (the click would then collapse what is already collapsed).
function hasOpenMainFolder(section) {
    return section.querySelector(":scope > ul > li.folder.open") !== null;
}

// The Folders chevron points down while any main folder is open
function updateFoldersChevron() {
    const section = bookmarkList.querySelector('.bm-section[data-section="folders"]');
    if (section) setSectionOpen(section, hasOpenMainFolder(section));
}

// ---- Search ----
// Rows carry a pre-lowercased `data-search` text, and are hidden with a class (not inline styles)
function applyBookmarkSearch() {
    clearTimeout(bookmarkSearchTimer);
    const term = bookmarkSearch.value.trim().toLowerCase();
    const items = bookmarkList.querySelectorAll("li[data-url]");
    const folders = Array.from(bookmarkList.querySelectorAll("li.folder")).reverse(); // inner folders first
    const sections = bookmarkList.querySelectorAll(".bm-section");
    const isHidden = row => row.classList.contains("bm-hidden");

    if (!term) {
        // Reset everything and restore the folders the way the user left them
        items.forEach(li => li.classList.remove("bm-hidden"));
        folders.forEach(li => {
            li.classList.remove("bm-hidden");
            setFolderOpen(li, !bookmarkCollapsedFolders.has(li.dataset.key));
        });
        sections.forEach(section => {
            section.classList.remove("bm-hidden");
            if (section.dataset.section !== "folders") {
                setSectionOpen(section, !bookmarkCollapsedSections.has(section.dataset.section));
            }
            section.querySelector(".bm-badge").textContent = localizeNumbers(String(section.dataset.count), currentLanguage);
        });
    } else {
        // A bookmark matches on its name or its URL
        items.forEach(li => li.classList.toggle("bm-hidden", !li.dataset.search.includes(term)));

        // A folder stays when its own name matches (and shows everything inside) or when a child matches
        folders.forEach(li => {
            if (li.dataset.search.includes(term)) {
                li.querySelectorAll("li").forEach(child => child.classList.remove("bm-hidden"));
                // Sub-folders inside a matching folder open too, or the rows inside them stay out of sight
                li.querySelectorAll("li.folder").forEach(sub => setFolderOpen(sub, true));
            }
            const hasVisibleChild = Array.from(li.querySelectorAll(":scope > ul > li")).some(child => !isHidden(child));
            li.classList.toggle("bm-hidden", !hasVisibleChild);
            if (hasVisibleChild) setFolderOpen(li, true);
        });

        sections.forEach(section => {
            const visibleRows = Array.from(section.querySelectorAll(":scope > ul > li")).filter(row => !isHidden(row));
            section.classList.toggle("bm-hidden", visibleRows.length === 0);
            // Matches are shown even in a collapsed section; the badge counts the rows that still match
            if (visibleRows.length && section.dataset.section !== "folders") setSectionOpen(section, true);
            section.querySelector(".bm-badge").textContent = localizeNumbers(String(visibleRows.length), currentLanguage);
        });
    }

    updateFoldersChevron();
    bookmarkSearchClearButton.style.display = term ? "inline" : "none";
}

// Typing is debounced so a long list is not re-filtered on every keystroke; clearing applies at once
let bookmarkSearchTimer = 0;
bookmarkSearch.addEventListener("input", function () {
    clearTimeout(bookmarkSearchTimer);
    const hasText = bookmarkSearch.value.trim() !== "";
    bookmarkSearchClearButton.style.display = hasText ? "inline" : "none";
    if (hasText) bookmarkSearchTimer = setTimeout(applyBookmarkSearch, 100);
    else applyBookmarkSearch();
});

// Sorting
bookmarkSortButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const method = button.dataset.sort;
        if (method === currentSortMethod) return;
        currentSortMethod = method;
        localStorage.setItem("bookmarkSortMethod", method);
        updateSortButtons();
        loadBookmarks();
    });
});

// The sliding pill in the segmented control follows --i (index of the active option)
function updateSortButtons() {
    const activeIndex = Math.max(0, bookmarkSortButtons.findIndex(button => button.dataset.sort === currentSortMethod));
    bookmarkSortButtons.forEach((button, index) => {
        button.classList.toggle("active", index === activeIndex);
        button.setAttribute("aria-pressed", String(index === activeIndex));
    });
    // --i is the button's position in the DOM; the CSS pill width relies on --count in style.css (#bookmarkSortGroup)
    bookmarkSortButtons[0]?.parentElement.style.setProperty("--i", activeIndex);
}

function updateViewButtons() {
    const isGrid = bookmarkGridCheckbox.checked;
    bookmarkViewGrid.classList.toggle("active", isGrid);
    bookmarkViewList.classList.toggle("active", !isGrid);
    bookmarkViewGrid.setAttribute("aria-pressed", String(isGrid));
    bookmarkViewList.setAttribute("aria-pressed", String(!isGrid));
    // Grid is the first button (index 0), List the second; keep that order in index.html
    bookmarkViewGrid.parentElement.style.setProperty("--i", isGrid ? 0 : 1);
    // Transitions off during the switch, or the three-dots buttons (shown in list, hidden in grid) fade out and
    // flash on every tile. The forced reflow applies the layout before transitions are switched back on.
    bookmarkList.classList.add("view-switching");
    bookmarkList.classList.toggle("grid-view", isGrid);
    void bookmarkList.offsetWidth;
    bookmarkList.classList.remove("view-switching");
}

function sortBookmarkNodes(nodes) {
    if (currentSortMethod === "default") return nodes; // keep the order the browser returns
    const direction = currentSortMethod.endsWith("-desc") ? -1 : 1;
    const byName = currentSortMethod.startsWith("title");
    // A bookmark without a name is sorted (and shown) by its hostname
    const nameOf = node => node.title || (node.url ? bmHost(node.url) : "");
    return [...nodes].sort((a, b) => direction * (byName
        ? nameOf(a).localeCompare(nameOf(b))
        : (a.dateAdded || 0) - (b.dateAdded || 0)));
}

bookmarkSearchClearButton.addEventListener("click", function () {
    bookmarkSearch.value = "";
    bookmarkSearch.dispatchEvent(new Event("input"));
});

function updateBookmarkUI(enabled) {
    bookmarksCheckbox.checked = enabled;
    bookmarkButton.style.display = enabled ? "flex" : "none";
    saveDisplayStatus("bookmarksDisplayStatus", enabled ? "flex" : "none");
    saveCheckboxState("bookmarksCheckboxState", bookmarksCheckbox);
}

async function verifyBookmarkPermission() {
    let bookmarksPermission;
    if (isFirefox) bookmarksPermission = browser.permissions;
    else if (isChromiumBased) bookmarksPermission = chrome.permissions;

    if (!bookmarksPermission) {
        await alertPrompt(translations[currentLanguage]?.UnsupportedBrowser ||
            translations['en'].UnsupportedBrowser);
        updateBookmarkUI(false);
        return false;
    }

    // Firefox always has permission
    if (isFirefox) {
        updateBookmarkUI(true);
        return true;
    }

    // Opera doesn't have favicon permission yet
    const requiredPermissions = isOpera ? ["bookmarks"] : ["bookmarks", "favicon"];

    const hasPermission = await new Promise(resolve =>
        chrome.permissions.contains({ permissions: requiredPermissions }, resolve));

    if (!hasPermission) {
        const granted = await new Promise(resolve =>
            chrome.permissions.request({ permissions: requiredPermissions }, resolve));

        if (!granted) {
            updateBookmarkUI(false);
            return false;
        }
        bookmarksAPI = chrome.bookmarks; // Initialize if just granted
    }

    updateBookmarkUI(true);
    return true;
}

async function toggleBookmarkSidebar() {
    const hasPermission = await verifyBookmarkPermission();
    if (hasPermission) {
        bookmarkSidebar.classList.toggle("open");
        bookmarkButton.classList.toggle("rotate");
        if (!bookmarkSidebar.classList.contains("open")) closeBookmarkMenus();

        if (bookmarkSidebar.classList.contains("open")) {
            loadBookmarks();
        }
    }
}

// Order in the list: Favorites, Recent, then the Folders (bookmarks bar first)
async function loadBookmarks() {
    if (!bookmarksAPI?.getTree) {
        console.info("Bookmarks API is unavailable. Please check permissions or context.");
        return;
    }

    const token = ++bookmarkLoadToken;

    try {
        const bookmarkTreeNodes = await bookmarksAPI.getTree();

        let recentBookmarks = [];
        if (bookmarkShowRecent.checked && bookmarksAPI.getRecent) {
            try {
                recentBookmarks = await bookmarksAPI.getRecent(getRecentCount());
            } catch (err) {
                console.warn("Unable to load recent bookmarks:", err);
            }
        }

        // A newer loadBookmarks() call started while we were waiting; let that one render
        if (token !== bookmarkLoadToken) return;

        const reopenRecentMenu = bookmarkRecentMenu.classList.contains("open");
        const previousScroll = bookmarkList.scrollTop;
        bookmarkMenuIgnoreScrollUntil = performance.now() + 250;
        bookmarkList.innerHTML = "";
        bookmarkNodeMap.clear();
        bookmarkRootId = bookmarkTreeNodes[0]?.id != null ? String(bookmarkTreeNodes[0].id) : null;

        // 1. Favorites (bookmarks and folders, in the order the user arranged them)
        const favoriteNodes = collectFavoriteNodes(bookmarkTreeNodes)
            .filter(node => node.url || node.children?.length > 0);
        bookmarkVisibleFavoriteIds = bookmarkShowFavorites.checked ? favoriteNodes.map(node => String(node.id)) : [];
        if (bookmarkShowFavorites.checked && favoriteNodes.length > 0) {
            bookmarkList.appendChild(createBookmarkSection(
                "favorites",
                getTranslation("favoriteBookmarks"),
                favoriteNodes.length,
                displayBookmarks(favoriteNodes, { sort: false, section: "favorites" }),
                { hasMenu: true }
            ));
        }

        // 2. Recently added (newest first, as the browser returns them)
        if (recentBookmarks.length > 0) {
            bookmarkList.appendChild(createBookmarkSection(
                "recent",
                getTranslation("recentlyAddedBookmarks"),
                recentBookmarks.length,
                displayBookmarks(recentBookmarks, { sort: false, section: "recent" }),
                { hasMenu: true }
            ));
        }

        // 3. Folders: every top-level folder (Bookmarks bar, Other bookmarks, ...) shown by its own name
        const rootChildren = bookmarkTreeNodes[0]?.children || [];
        const rootFolders = rootChildren.filter(node => node.children && node.children.length > 0);
        const defaultFolder = findDefaultBookmarkFolder(rootChildren);
        const defaultIndex = rootFolders.indexOf(defaultFolder);
        if (defaultIndex > 0) rootFolders.unshift(rootFolders.splice(defaultIndex, 1)[0]);

        if (rootFolders.length > 0) {
            bookmarkList.appendChild(createBookmarkSection(
                "folders",
                getTranslation("foldersSection"),
                rootFolders.length,
                displayBookmarks(rootFolders, { sort: false, section: "folders" })
            ));
        }

        bookmarkList.scrollTo({ top: previousScroll, behavior: "instant" });

        // Keep the Recent menu open (e.g. while stepping the count) by moving it to the new button
        if (reopenRecentMenu) {
            const recentButton = bookmarkList.querySelector('.bm-section[data-section="recent"] .bm-section-more');
            if (recentButton) {
                bookmarkItemMenuAnchor = recentButton;
                recentButton.classList.add("active");
                positionBookmarkMenu(bookmarkRecentMenu, recentButton);
            } else {
                closeBookmarkItemMenu();
            }
        }

        updateFoldersChevron();

        // Keep an active search filter applied after re-rendering
        if (bookmarkSearch.value) applyBookmarkSearch();
    } catch (err) {
        console.warn("Unable to load bookmarks:", err);
    }
}

function setBookmarkFavicon(faviconElement, pageUrl) {
    const offlineFallback = () => faviconElement.src = "./svgs/offline.svg";

    const googleFallback = () => {
        faviconElement.src = `https://www.google.com/s2/favicons?domain=${new URL(pageUrl).hostname}&sz=32`;
        faviconElement.onerror = offlineFallback;
    };

    // Fallback chain: browser favicon (Chromium only) -> Google -> local offline icon
    if (!isFirefox && !isOpera) {
        faviconElement.src = `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(pageUrl)}&size=32`;
        faviconElement.onerror = googleFallback;
    } else {
        googleFallback();
    }
}

// ---- Rendering ----
// Rows are plain DOM without listeners of their own: one delegated click handler on #bookmarkList (below)
// handles links, three-dots buttons and fold chevrons, which keeps building long lists cheap.
let bookmarkMoreButtonTemplate = null;
let bookmarkChevronButtonTemplate = null;

function createMoreButton() {
    if (!bookmarkMoreButtonTemplate) {
        const button = document.createElement("button");
        button.type = "button";
        button.classList.add("bookmark-more-button");
        button.setAttribute("aria-label", "Bookmark options");
        button.setAttribute("aria-haspopup", "true");
        button.innerHTML = bmIcon("dots");
        bookmarkMoreButtonTemplate = button;
    }
    return bookmarkMoreButtonTemplate.cloneNode(true);
}

function createChevronButton(isOpen) {
    if (!bookmarkChevronButtonTemplate) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "bm-chevron-btn";
        button.setAttribute("aria-label", "Expand / collapse");
        button.innerHTML = bmIcon("chevrondown", "bm-chevron");
        bookmarkChevronButtonTemplate = button;
    }
    const button = bookmarkChevronButtonTemplate.cloneNode(true);
    button.setAttribute("aria-expanded", String(isOpen));
    return button;
}

// A titled block of the list ("Favorites", "Recent", "Folders"): [title + count] [dots (Recent)] [chevron]
function createBookmarkSection(key, title, count, list, { hasMenu = false } = {}) {
    const section = document.createElement("li");
    section.className = "bm-section";
    section.dataset.section = key;
    section.dataset.count = count; // restored when a search is cleared

    const header = document.createElement("div");
    header.className = "bm-section-header";

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "bm-section-toggle";
    toggle.innerHTML = '<span class="bm-section-title"></span><span class="bm-badge"></span>';
    toggle.querySelector(".bm-section-title").textContent = title;
    toggle.querySelector(".bm-badge").textContent = localizeNumbers(String(count), currentLanguage);
    header.appendChild(toggle);

    if (hasMenu) {
        const more = createMoreButton();
        more.classList.add("bm-section-more");
        more.setAttribute("aria-label", "Section options");
        header.appendChild(more);
    }
    header.appendChild(createChevronButton(true));

    section.append(header, list);
    // "Folders" is always visible; its chevron state is set from the folders (updateFoldersChevron)
    setSectionOpen(section, key === "folders" || !bookmarkCollapsedSections.has(key));
    return section;
}

// options.sort: false keeps the given order (Favorites, Recent, top-level folders)
function displayBookmarks(bookmarkNodes, { sort = true, section = "" } = {}) {
    const list = document.createElement("ul");

    let nodes = bookmarkNodes.filter(node => node.url || (node.children && node.children.length > 0));

    // Browser order keeps bookmarks and folders mixed, exactly as in the browser's bookmark manager
    if (sort && currentSortMethod !== "default") {
        // Bookmarks first, then folders; each group sorted separately
        const bookmarks = sortBookmarkNodes(nodes.filter(node => node.url));
        const folders = sortBookmarkNodes(nodes.filter(node => !node.url));
        nodes = [...bookmarks, ...folders];
    }

    nodes.forEach(node => {
        list.appendChild(node.url ? createBookmarkItem(node) : createFolderItem(node, section));
    });

    return list;
}

function createFolderItem(node, section) {
    bookmarkNodeMap.set(String(node.id), node);

    const key = `${section}/${node.id}`;
    const isOpen = !bookmarkCollapsedFolders.has(key);

    const item = document.createElement("li");
    item.classList.add("folder");
    item.classList.toggle("open", isOpen);
    item.dataset.id = node.id;
    item.dataset.key = key;
    item.dataset.title = node.title || "";
    item.dataset.search = (node.title || "").toLowerCase();

    // Row: [icon + name] [dots] [chevron]
    const row = document.createElement("div");
    row.className = "folder-row";

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "folder-toggle";
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.innerHTML = `<span class="bm-folder-tile">${bmIcon("folder")}</span><span class="bm-text"><span class="bm-title"></span></span>`;
    toggle.querySelector(".bm-title").textContent = node.title;

    row.append(toggle, createMoreButton(), createChevronButton(isOpen));
    item.append(row, displayBookmarks(node.children, { section }));
    return item;
}

function createBookmarkItem(node) {
    bookmarkNodeMap.set(String(node.id), node);

    const item = document.createElement("li");
    item.dataset.id = node.id;
    item.dataset.url = node.url;
    item.dataset.title = node.title || "";
    item.dataset.search = `${node.title || ""}\n${node.url}`.toLowerCase();
    if (node.parentId) item.dataset.parentId = node.parentId;

    const link = document.createElement("a");
    link.href = node.url;
    link.title = node.title ? `${node.title}\n${node.url}` : node.url;

    const favicon = document.createElement("img");
    // Lazy-load icons near the viewport and decode them off the main thread (set before src).
    // Rows use content-visibility with fixed height estimates in style.css (56px list / 92px grid);
    // update those if the icon size changes.
    favicon.loading = "lazy";
    favicon.decoding = "async";
    setBookmarkFavicon(favicon, node.url);
    favicon.classList.add("favicon");
    favicon.alt = "";

    const text = document.createElement("span");
    text.className = "bm-text";
    const title = document.createElement("span");
    title.className = "bm-title";
    title.textContent = node.title || bmHost(node.url);
    const address = document.createElement("span");
    address.className = "bm-url";
    // Name on top (the hostname when the bookmark has no name), the URL without http(s):// underneath;
    // the tooltip (link.title) has the full URL
    address.textContent = bmPrettyUrl(node.url);
    text.append(title, address);

    link.append(favicon, text);
    item.append(link, createMoreButton());
    return item;
}

// Open links in the current tab, or in a new background tab when ctrl / cmd is pressed
function openBookmarkLink(event, url) {
    event.preventDefault();
    if (event.ctrlKey || event.metaKey) {
        if (isFirefox) {
            browser.tabs.create({ url: url, active: false });
        } else if (isChromiumBased) {
            chrome.tabs.create({ url: url, active: false });
        } else {
            window.open(url, "_blank");
        }
    } else if (isFirefox) {
        browser.tabs.update({ url: url });
    } else if (isChromiumBased) {
        chrome.tabs.update({ url: url }, function () {
        });
    } else {
        window.location.href = url;
    }
}

// Position of a row inside the Favorites section (drives Move up / Move down in its menu)
function getBookmarkRowContext(row) {
    const list = row.parentElement;
    const section = list?.parentElement;
    if (!section?.classList.contains("bm-section") || section.dataset.section !== "favorites") return {};
    const rows = Array.from(list.children);
    return { inFavorites: true, index: rows.indexOf(row), total: rows.length };
}

// One click handler for the whole list
bookmarkList.addEventListener("click", function (event) {
    const target = event.target;

    const moreButton = target.closest(".bookmark-more-button");
    if (moreButton) {
        event.preventDefault();
        event.stopPropagation();
        if (moreButton.classList.contains("bm-section-more")) {
            if (moreButton.closest(".bm-section").dataset.section === "favorites") openFavoritesMenu(moreButton);
            else openRecentMenu(moreButton);
            return;
        }
        const row = moreButton.closest("li");
        const node = row && bookmarkNodeMap.get(row.dataset.id);
        if (node) openBookmarkItemMenu(moreButton, node, getBookmarkRowContext(row));
        return;
    }

    const folderControl = target.closest(".folder-toggle, .folder-row > .bm-chevron-btn");
    if (folderControl) {
        toggleFolder(folderControl.closest("li.folder"));
        return;
    }

    const sectionControl = target.closest(".bm-section-toggle, .bm-section-header > .bm-chevron-btn");
    if (sectionControl) {
        toggleSection(sectionControl.closest(".bm-section"));
        return;
    }

    const link = target.closest("li[data-url] > a");
    if (link) openBookmarkLink(event, link.parentElement.dataset.url);
});

// Right-click (context menu) event
bookmarkList.addEventListener("contextmenu", function (event) {
    event.preventDefault();

    const bookmarkItem = event.target.closest("li[data-url]");
    if (!bookmarkItem) return;

    closeBookmarkItemMenu();
    openBookmarkModal("edit", {
        id: bookmarkItem.dataset.id,
        title: bookmarkItem.dataset.title,
        url: bookmarkItem.dataset.url,
        parentId: bookmarkItem.dataset.parentId
    });
});

editBookmarkURL.addEventListener("input", () => {
    editBookmarkURL.setCustomValidity("");
    saveBookmarkChanges.disabled = editBookmarkURL.value.trim() === "";
});

// Save button action (adds a new bookmark or updates the one being edited)
saveBookmarkChanges.onclick = async function () {
    const title = editBookmarkName.value.trim();
    const rawUrl = normalizeBookmarkUrl(editBookmarkURL.value.trim());
    if (!editBookmarkURL.value.trim()) return;

    const href = toBookmarkHref(rawUrl);
    if (!href) {
        editBookmarkURL.setCustomValidity(getTranslation("invalidBookmarkUrl"));
        editBookmarkURL.reportValidity();
        return;
    }

    try {
        if (bookmarkModalMode === "add") {
            const details = { title: title || rawUrl, url: href };

            // The folder picked in the modal (the bookmarks bar / toolbar unless changed)
            let parentId = editBookmarkFolder.value;
            if (!parentId) {
                const tree = await bookmarksCall("getTree");
                parentId = findDefaultBookmarkFolder(tree[0]?.children || [])?.id;
            }
            if (parentId) details.parentId = parentId;

            await bookmarksCall("create", details);
        } else {
            if (!currentBookmarkId) return;
            await bookmarksCall("update", currentBookmarkId, { title: title, url: href });

            // Only move when the folder was changed, so the bookmark keeps its position otherwise
            const newParentId = editBookmarkFolder.value;
            if (newParentId && editBookmarkOriginalParentId && newParentId !== editBookmarkOriginalParentId) {
                await bookmarksCall("move", currentBookmarkId, { parentId: newParentId });
            }
        }

        editBookmarkModal.style.display = "none";
        loadBookmarks();
    } catch (err) {
        console.error("Error saving bookmark:", err);
    }
};

cancelBookmarkEdit.onclick = function () {
    editBookmarkModal.style.display = "none";
};

editBookmarkName.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        editBookmarkURL.focus();
    }
});

editBookmarkURL.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        if (!saveBookmarkChanges.disabled) {
            saveBookmarkChanges.click();
        }
    }
});

// ------------------------ End of Bookmark System -----------------------------------

// Save and load the state of the bookmarks toggle
document.addEventListener("DOMContentLoaded", function () {
    bookmarksCheckbox.addEventListener("change", async function () {
        if (!bookmarksCheckbox.checked) {
            updateBookmarkUI(false);
            return;
        }
        await verifyBookmarkPermission();
    });

    bookmarkGridCheckbox.addEventListener("change", function () {
        saveCheckboxState("bookmarkGridCheckboxState", bookmarkGridCheckbox);
        updateViewButtons();
    });

    loadCheckboxState("bookmarksCheckboxState", bookmarksCheckbox);
    loadDisplayStatus("bookmarksDisplayStatus", bookmarkButton);
    loadCheckboxState("bookmarkGridCheckboxState", bookmarkGridCheckbox, true);
    updateViewButtons();
    syncBookmarkMenuState();
});

// Tooltips of the Sort by / View as icon buttons and the folder picker buttons come from their label text (so translations still apply)
function setIconButtonTooltip(event) {
    const button = event.target.closest?.(".bm-icon-btn, .bm-folder-action");
    if (button) button.dataset.tooltip = button.textContent.trim();
}
bookmarkMenu.addEventListener("mouseover", setIconButtonTooltip);
bookmarkMenu.addEventListener("focusin", setIconButtonTooltip);
editBookmarkModal.addEventListener("mouseover", setIconButtonTooltip);
editBookmarkModal.addEventListener("focusin", setIconButtonTooltip);

// Keyboard shortcut for bookmarks
document.addEventListener("keydown", function (event) {
    // Prevent shortcut if modal or menu is open
    const modalContainer = document.getElementById("prompt-modal-container");
    if (modalContainer?.style.display === "flex" || menuBar.style.display !== "none") {
        return;
    }

    if (bookmarksCheckbox.checked &&
        event.key === "ArrowRight" &&
        !event.repeat &&
        event.target.tagName !== "INPUT" &&
        event.target.tagName !== "TEXTAREA" &&
        event.target.tagName !== "SELECT" &&
        event.target.isContentEditable !== true
    ) {
        bookmarkButton.click();
    }
});
