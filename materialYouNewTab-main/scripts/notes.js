/*
 * Material You NewTab
 * Copyright (c) 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

// ----------------------------------- Notes ----------------------------------------
// DOM Variables
const notesListCont = document.getElementById("notesListCont");
const notesContainer = document.getElementById("notesContainer");
const notesList = document.getElementById("notesList");
const notesAddBtn = document.getElementById("notesAddBtn");

const noteEditorModal = document.getElementById("noteEditorModal");
const noteTitleInput = document.getElementById("noteTitleInput");
const noteContentEditor = document.getElementById("noteContentEditor");
const noteFormatSelect = document.getElementById("noteFormatSelect");
const noteBoldBtn = document.getElementById("noteBoldBtn");
const noteItalicBtn = document.getElementById("noteItalicBtn");
const noteUnderlineBtn = document.getElementById("noteUnderlineBtn");
const noteOpacitySlider = document.getElementById("noteOpacitySlider");
const noteOpacityLabel = document.getElementById("noteOpacityLabel");
const noteSaveBtn = document.getElementById("noteSaveBtn");
const noteDeleteBtn = document.getElementById("noteDeleteBtn");
const noteCloseBtn = document.getElementById("noteCloseBtn");

let notesData = {}; // Initialize notes JSON
let activeNoteId = null; // Currently open note in the editor ("" while creating a new one)

// ---------------------- Utility functions ----------------------

// Escape HTML so titles can never inject markup
function escapeHtml(input) {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
}

// Strip anything that could execute script content (script/style tags, event handlers, javascript: urls)
// This is only a defensive layer for pasted content inside the contenteditable editor.
function sanitizeNoteContent(html) {
    const template = document.createElement("template");
    template.innerHTML = html;

    const walk = (node) => {
        // Copy childNodes to an array since we may remove nodes while iterating
        Array.from(node.childNodes).forEach((child) => {
            if (child.nodeType === Node.ELEMENT_NODE) {
                const tag = child.tagName.toLowerCase();
                if (tag === "script" || tag === "style" || tag === "iframe" || tag === "object" || tag === "embed") {
                    child.remove();
                    return;
                }
                // Remove event handler attributes and javascript: URLs
                Array.from(child.attributes).forEach((attr) => {
                    const name = attr.name.toLowerCase();
                    const value = attr.value.trim().toLowerCase();
                    if (name.startsWith("on") || ((name === "href" || name === "src") && value.startsWith("javascript:"))) {
                        child.removeAttribute(attr.name);
                    }
                });
                walk(child);
            }
        });
    };

    walk(template.content);
    return template.innerHTML;
}

// Build a short plain-text preview from the note's HTML content
function getNotePreview(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    const text = (div.textContent || "").replace(/\s+/g, " ").trim();
    return text.length > 80 ? text.slice(0, 80) + "…" : text;
}

// Format a timestamp as a short date (e.g. "Aug 14")
function formatNoteDate(timestamp) {
    try {
        return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch (error) {
        return "";
    }
}

// ---------------------- Load / Save ----------------------

function loadNotes() {
    try {
        notesData = JSON.parse(localStorage.getItem("notesData")) || {};
    } catch (error) {
        console.error("Error loading notes from localStorage:", error);
        notesData = {};
        localStorage.setItem("notesData", "{}"); // Reset corrupted data
    }
}

function saveNotesData() {
    localStorage.setItem("notesData", JSON.stringify(notesData));
}

// ---------------------- List rendering ----------------------

function createNoteItemDOM(id, note) {
    const li = document.createElement("li");
    li.className = "note-item";
    li.dataset.noteId = id;

    const textWrap = document.createElement("div");
    textWrap.className = "note-item-text";

    const titleEl = document.createElement("div");
    titleEl.className = "note-item-title";
    titleEl.innerHTML = escapeHtml(note.title || "");

    const previewEl = document.createElement("div");
    previewEl.className = "note-item-preview";
    previewEl.textContent = getNotePreview(note.content || "");

    const dateEl = document.createElement("div");
    dateEl.className = "note-item-date";
    dateEl.textContent = formatNoteDate(note.updated || note.created);

    textWrap.appendChild(titleEl);
    textWrap.appendChild(previewEl);
    textWrap.appendChild(dateEl);

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "note-item-delete";
    deleteBtn.setAttribute("aria-label", "Delete");
    deleteBtn.textContent = "\u00d7";

    li.appendChild(textWrap);
    li.appendChild(deleteBtn);

    return li;
}

function renderNotesList() {
    notesList.innerHTML = "";

    const sortedIds = Object.keys(notesData).sort((a, b) => {
        const aTime = notesData[a].updated || notesData[a].created || 0;
        const bTime = notesData[b].updated || notesData[b].created || 0;
        return bTime - aTime;
    });

    const fragment = document.createDocumentFragment();
    sortedIds.forEach((id) => {
        fragment.appendChild(createNoteItemDOM(id, notesData[id]));
    });
    notesList.appendChild(fragment);
}

// Click handling for note list (open editor / delete)
notesList.addEventListener("click", async (event) => {
    const deleteBtn = event.target.closest(".note-item-delete");
    const item = event.target.closest(".note-item");
    if (!item) return;

    const id = item.dataset.noteId;

    if (deleteBtn) {
        const note = notesData[id];
        const title = note ? note.title || "" : "";
        const promptText = (translations[currentLanguage]?.deleteNotePrompt || translations["en"].deleteNotePrompt)
            .replace("{title}", title);

        const confirmed = await confirmPrompt(promptText);
        if (confirmed) {
            delete notesData[id];
            saveNotesData();
            renderNotesList();
        }
        return;
    }

    openNoteEditor(id);
});

// ---------------------- Editor lifecycle ----------------------

function loadOpacitySetting() {
    const saved = localStorage.getItem("notesEditorOpacity");
    const opacity = saved ? Number(saved) : 70;
    updateEditorOpacity(opacity);
}

function updateEditorOpacity(value) {
    const clamped = Math.min(90, Math.max(30, Number(value) || 70));
    noteOpacitySlider.value = clamped;
    noteOpacityLabel.textContent = `${clamped}%`;
    document.documentElement.style.setProperty("--editor-bg-opacity", `${clamped}%`);
    localStorage.setItem("notesEditorOpacity", clamped);
}

noteOpacitySlider.addEventListener("input", () => {
    updateEditorOpacity(noteOpacitySlider.value);
});

function openNoteEditor(id) {
    const note = id ? notesData[id] : null;

    activeNoteId = id || "";
    noteTitleInput.value = note ? note.title : "";
    noteContentEditor.innerHTML = note ? sanitizeNoteContent(note.content || "") : "";

    // Only existing notes can be deleted from within the editor
    noteDeleteBtn.style.display = note ? "inline-block" : "none";

    noteEditorModal.style.display = "flex";
    requestAnimationFrame(() => {
        noteEditorModal.classList.add("open");
    });

    updateToolbarButtons();
    setTimeout(() => noteTitleInput.focus(), 50);
}

function closeNoteEditor() {
    noteEditorModal.classList.remove("open");
    setTimeout(() => {
        noteEditorModal.style.display = "none";
    }, 200);
    activeNoteId = null;
}

function saveNote() {
    if (activeNoteId === null) return;

    const title = noteTitleInput.value.trim();
    const content = sanitizeNoteContent(noteContentEditor.innerHTML.trim());

    // Ignore empty notes (no title and no content)
    const plainContent = noteContentEditor.textContent.trim();
    if (title === "" && plainContent === "") {
        closeNoteEditor();
        return;
    }

    const now = Date.now();

    if (activeNoteId === "") {
        const id = "n" + now;
        notesData[id] = { title, content, created: now, updated: now };
    } else {
        const existing = notesData[activeNoteId] || { created: now };
        notesData[activeNoteId] = { title, content, created: existing.created, updated: now };
    }

    saveNotesData();
    renderNotesList();
    closeNoteEditor();
}

async function deleteActiveNote() {
    if (!activeNoteId) return;

    const note = notesData[activeNoteId];
    const title = note ? note.title || "" : "";
    const promptText = (translations[currentLanguage]?.deleteNotePrompt || translations["en"].deleteNotePrompt)
        .replace("{title}", title);

    const confirmed = await confirmPrompt(promptText);
    if (confirmed) {
        delete notesData[activeNoteId];
        saveNotesData();
        renderNotesList();
        closeNoteEditor();
    }
}

noteSaveBtn.addEventListener("click", saveNote);
noteDeleteBtn.addEventListener("click", deleteActiveNote);
noteCloseBtn.addEventListener("click", closeNoteEditor);

notesAddBtn.addEventListener("click", () => {
    openNoteEditor(null);
});

// ---------------------- Formatting ----------------------

function applyFormat(command, value) {
    noteContentEditor.focus();
    document.execCommand(command, false, value || null);
    updateToolbarButtons();
}

function updateToolbarButtons() {
    noteBoldBtn.classList.toggle("active", document.queryCommandState("bold"));
    noteItalicBtn.classList.toggle("active", document.queryCommandState("italic"));
    noteUnderlineBtn.classList.toggle("active", document.queryCommandState("underline"));

    try {
        const block = document.queryCommandValue("formatBlock").toLowerCase();
        noteFormatSelect.value = ["h1", "h2", "h3", "h4"].includes(block) ? block : "p";
    } catch (error) {
        noteFormatSelect.value = "p";
    }
}

noteBoldBtn.addEventListener("click", () => applyFormat("bold"));
noteItalicBtn.addEventListener("click", () => applyFormat("italic"));
noteUnderlineBtn.addEventListener("click", () => applyFormat("underline"));

noteFormatSelect.addEventListener("change", () => {
    const value = noteFormatSelect.value === "p" ? "P" : noteFormatSelect.value.toUpperCase();
    applyFormat("formatBlock", value);
});

noteContentEditor.addEventListener("keyup", updateToolbarButtons);
noteContentEditor.addEventListener("mouseup", updateToolbarButtons);

// ---------------------- Panel toggle ----------------------

notesListCont.addEventListener("click", function () {
    const isMenuVisible = notesContainer.style.display === "grid";

    notesContainer.style.display = isMenuVisible ? "none" : "grid";

    if (!isMenuVisible) {
        notesListCont.classList.add("menu-open"); // Hide tooltip
        renderNotesList();
    } else {
        notesListCont.classList.remove("menu-open"); // Restore tooltip
    }
});

// Close panel / modal when clicking outside
document.addEventListener("click", function (event) {
    const isClickInsidePanel = notesContainer.contains(event.target) || notesListCont.contains(event.target);
    if (!isClickInsidePanel && notesContainer.style.display === "grid") {
        notesContainer.style.display = "none";
        notesListCont.classList.remove("menu-open");
    }

    if (event.target === noteEditorModal) {
        closeNoteEditor();
    }
});

// Escape key closes the editor modal
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && noteEditorModal.classList.contains("open")) {
        closeNoteEditor();
    }
});

// ---------------------- Init ----------------------
loadNotes();
loadOpacitySetting();

// ----------------------- Notes Toggle -----------------------------
document.addEventListener("DOMContentLoaded", function () {
    const notesCheckbox = document.getElementById("notesCheckbox");

    notesCheckbox.addEventListener("change", function () {
        saveCheckboxState("notesCheckboxState", notesCheckbox);
        if (notesCheckbox.checked) {
            notesListCont.style.display = "flex";
            saveDisplayStatus("notesDisplayStatus", "flex");
        } else {
            notesListCont.style.display = "none";
            saveDisplayStatus("notesDisplayStatus", "none");
        }
    });

    loadCheckboxState("notesCheckboxState", notesCheckbox);
    loadDisplayStatus("notesDisplayStatus", notesListCont);
});
