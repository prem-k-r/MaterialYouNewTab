/*
 * Material You NewTab
 * Copyright (c) 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

// Define the list of available AI tools and their default visibility
const aiToolsRaw = [
    { id: "chatGPT", visible: true, order: 0 },
    { id: "gemini", visible: true, order: 1 },
    { id: "claude", visible: true, order: 2 },
    { id: "deepseek", visible: true, order: 3 },
    { id: "copilot", visible: true, order: 4 },
    { id: "perplexity", visible: false, order: 5 },
    { id: "grok", visible: false, order: 6 },
    { id: "metaAI", visible: false, order: 7 }
];
// Translations for AI tools
const aiTools = aiToolsRaw.map(tool => ({
    ...tool,
    label: getTranslation(tool.id, tool.id)
}));

// DOM Elements
const aiToolName = document.getElementById("toolsCont");
const shortcuts = document.getElementById("shortcutsContainer");
const aiToolsIcon = document.getElementById("aiToolsIcon");
const aiToolsSettingsModal = document.getElementById("aiToolsSettingsModal");
const aiToolsSettingsOverlay = document.getElementById("aiToolsSettingsOverlay");
const aiToolsForm = document.getElementById("aiToolsForm");
const closeAISettingsBtn = document.getElementById("closeAISettingsBtn");
const resetAISettingsBtn = document.getElementById("resetAISettingsBtn");
const saveAISettingsBtn = document.getElementById("saveAISettingsBtn");
const aiToolsEditButton = document.getElementById("aiToolsEditButton");
const aiToolsCont = document.getElementById("aiToolsCont");
const aiToolsEditField = document.getElementById("aiToolsEditField");
const aiToolEditor = document.getElementById("aiToolEditor");
const aiToolNameInput = document.getElementById("aiToolNameInput");
const aiToolUrlInput = document.getElementById("aiToolUrlInput");
const aiToolEditorSaveBtn = document.getElementById("aiToolEditorSaveBtn");
const aiToolEditorCancelBtn = document.getElementById("aiToolEditorCancelBtn");
const aiToolAddBtn = document.getElementById("aiToolAddBtn");
const aiToolEditorTitle = document.getElementById("aiToolEditorTitle");
const aiToolIconInput = document.getElementById("aiToolIconInput");
const aiToolIconUploadBtn = document.getElementById("aiToolIconUploadBtn");
const aiToolIconFileInput = document.getElementById("aiToolIconFileInput");
const aiToolIconPreview = document.getElementById("aiToolIconPreview");

const MAX_CUSTOM_AI_TOOLS = 20;
const CUSTOM_TOOL_ID_REGEX = /^custom_[a-z0-9]+$/;

// Custom tools being edited in the settings modal (committed on Save)
let customToolsDraft = [];
let editingToolId = null;
let isReordering = false;
let previewTimeoutId;
let viewTimeoutId;
let listScrollTop = 0;

// Animation helper function
function animateReorder(element1, element2, direction) {
    return new Promise((resolve) => {
        // Get the current positions
        const rect1 = element1.getBoundingClientRect();
        const rect2 = element2.getBoundingClientRect();

        // Calculate the distance to move
        const distance = Math.abs(rect1.top - rect2.top);

        // Set CSS custom properties for the distance
        element1.style.setProperty("--move-distance", `${distance}px`);
        element2.style.setProperty("--move-distance", `${distance}px`);

        // Get button references
        const element1UpBtn = element1.querySelector(".reorder-up");
        const element1DownBtn = element1.querySelector(".reorder-down");
        const element2UpBtn = element2.querySelector(".reorder-up");
        const element2DownBtn = element2.querySelector(".reorder-down");

        // Disable interactions
        element1.style.pointerEvents = "none";
        element2.style.pointerEvents = "none";

        // Add animation classes
        if (direction === "up") {
            element1.classList.add("reorder-animate-up");
            element2.classList.add("reorder-animate-down");
        } else {
            element1.classList.add("reorder-animate-down");
            element2.classList.add("reorder-animate-up");
        }

        // Update button states at halfway point
        setTimeout(() => {
            [element1UpBtn.disabled, element2UpBtn.disabled] = [element2UpBtn.disabled, element1UpBtn.disabled];
            [element1DownBtn.disabled, element2DownBtn.disabled] = [element2DownBtn.disabled, element1DownBtn.disabled];
        }, 150);

        // Complete animation
        setTimeout(() => {
            // Perform DOM swap
            if (direction === "up") {
                aiToolsForm.insertBefore(element1, element2);
            } else {
                aiToolsForm.insertBefore(element2, element1);
            }

            // Clean up
            [element1, element2].forEach(el => {
                el.classList.remove("reorder-animate-up", "reorder-animate-down");
                el.style.removeProperty("--move-distance");
                el.style.pointerEvents = "";
            });

            updateReorderButtonStates();
            resolve();
        }, 300);
    });
}

// Visible tools are stored as "id", hidden ones as { id: false }
function toSetting(id, visible) {
    return visible ? id : { [id]: false };
}

function parseSetting(item) {
    return typeof item === "string" ? [item, true] : [Object.keys(item)[0], false];
}

function getSavedAIToolsSettings() {
    return JSON.parse(localStorage.getItem("aiToolsSettings") || "null");
}

// Returns the normalized URL if valid, otherwise null
function parseToolUrl(url) {
    try {
        return new URL(iconUtils.normalizeUrl(url)).href;
    } catch {
        return null;
    }
}

function getCustomTools() {
    try {
        const stored = JSON.parse(localStorage.getItem("aiCustomTools") || "[]");
        if (!Array.isArray(stored)) return [];
        return stored
            .filter(tool => tool && CUSTOM_TOOL_ID_REGEX.test(tool.id) && typeof tool.name === "string" && parseToolUrl(String(tool.url)))
            .map(tool => ({ ...tool, icon: typeof tool.icon === "string" ? tool.icon : "" }));
    } catch {
        return [];
    }
}

// Saved order/visibility, minus tools that no longer exist, plus tools that are missing (new or never saved)
function normalizeAIToolsSettings(saved, customTools) {
    const defaults = [...aiTools, ...customTools.map(tool => ({ id: tool.id, visible: true }))];
    const knownIds = new Set(defaults.map(tool => tool.id));
    const seenIds = new Set();
    const result = [];

    (Array.isArray(saved) ? saved : []).forEach(item => {
        if (!item) return;
        const [id, visible] = parseSetting(item);
        if (knownIds.has(id) && !seenIds.has(id)) {
            seenIds.add(id);
            result.push(toSetting(id, visible));
        }
    });
    defaults.forEach(tool => {
        if (!seenIds.has(tool.id)) result.push(toSetting(tool.id, tool.visible));
    });
    return result;
}

function createCustomToolLink(tool) {
    const safeUrl = parseToolUrl(String(tool.url));
    if (!safeUrl) return null;

    const link = document.createElement("a");
    link.href = safeUrl;
    link.dataset.custom = "true";
    link.dataset.toolId = tool.id;

    const icon = document.createElement("div");
    icon.className = "tIcon customToolIcon";
    icon.appendChild(iconUtils.getLogoHtml(tool.name, safeUrl, tool.icon));

    const label = document.createElement("div");
    label.className = "tLabel";
    label.textContent = tool.name;

    link.append(icon, label);
    return link;
}

// Function to read the settings (visibility and order) from the settings form
function collectAIToolsSettings() {
    return [...document.querySelectorAll(".ai-tool-option")].map(option => {
        const toolId = option.dataset.toolId;
        return toSetting(toolId, document.getElementById(`setting_${toolId}`).checked);
    });
}

// Function to save AI tools settings
function saveAIToolsSettings() {
    localStorage.setItem("aiToolsSettings", JSON.stringify(collectAIToolsSettings()));
}

// Function to apply saved settings (visibility and order)
function applyAIToolsSettings() {
    const customTools = getCustomTools();
    const savedSettings = getSavedAIToolsSettings();
    const settingsToApply = normalizeAIToolsSettings(savedSettings, customTools);

    if (!Array.isArray(savedSettings)) {
        // Initialize with default values if no settings exist
        localStorage.setItem("aiToolsSettings", JSON.stringify(settingsToApply));
    }

    // Create a map of current tool elements for quick lookup (custom tools are rebuilt from storage)
    const toolElements = new Map();
    const allToolLinks = aiToolName.querySelectorAll("a:not([data-custom])");
    allToolLinks.forEach(link => {
        const toolId = [...link.children].find(el => aiToolsRaw.some(t => t.id === el.id))?.id;
        if (toolId) toolElements.set(toolId, link);
    });
    customTools.forEach(tool => {
        const customLink = createCustomToolLink(tool);
        if (customLink) toolElements.set(tool.id, customLink);
    });

    // Clear container
    aiToolName.innerHTML = "";

    // Append tools in order based on settings
    settingsToApply.forEach(item => {
        const [toolId, isVisible] = parseSetting(item);

        const toolElement = toolElements.get(toolId);
        if (toolElement) {
            toolElement.style.display = isVisible ? "flex" : "none";
            aiToolName.appendChild(toolElement);
        }
    });

    updateAIToolShortcutBadges();
}

// Assigns 1-9 shortcut badge indices to visible AI tool links in rendered order
function updateAIToolShortcutBadges() {
    let visibleIndex = 0;
    aiToolName.querySelectorAll("a").forEach(link => {
        if (link.style.display !== "none" && visibleIndex < 9) {
            link.dataset.shortcut = String(++visibleIndex);
        } else {
            delete link.dataset.shortcut;
        }
    });
}

function getToolLabel(toolId) {
    return aiTools.find(t => t.id === toolId)?.label
        || customToolsDraft.find(t => t.id === toolId)?.name
        || toolId;
}

function createToolOption(toolId, isVisible) {
    const isCustom = customToolsDraft.some(t => t.id === toolId);

    const toolOption = document.createElement("div");
    toolOption.className = "ai-tool-option";
    toolOption.dataset.toolId = toolId;
    toolOption.innerHTML = `
        <div class="ai-tool-controls">
            <input type="checkbox">
            <label></label>
        </div>
        <div class="ai-tool-reorder">
            ${isCustom ? `
            <button type="button" class="tool-edit"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 520" width="14" height="14"><path fill="currentColor" d="m95 334 89 89c4 4 10 4 14 0l222-223c4-4 4-10 0-14l-88-88a10 10 0 0 0-14 0L95 321c-4 4-4 10 0 13zM361 57a10 10 0 0 0 0 14l88 88c4 4 10 4 14 0l25-25a38 38 0 0 0 0-55l-47-47a40 40 0 0 0-57 0zM21 482c-2 10 7 19 17 17l109-26c4-1 7-3 9-5l2-2c2-2 3-9-1-13l-90-90c-4-4-11-3-13-1l-2 2a20 20 0 0 0-5 9z"/></svg></button>
            <button type="button" class="tool-delete"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"/></svg></button>` : ""}
            <button type="button" class="reorder-up"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M10.974 8.192a1.465 1.465 0 0 1 2.07 0l5.527 5.524a1.465 1.465 0 1 1-2.073 2.072l-4.49-4.488-4.488 4.49a1.465 1.465 0 1 1-2.073-2.072Z"/></svg></button>
            <button type="button" class="reorder-down"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M13.047 15.809a1.47 1.47 0 0 1-2.076 0l-5.54-5.54a1.47 1.47 0 1 1 2.077-2.076l4.501 4.5 4.501-4.5a1.469 1.469 0 0 1 2.078 2.076l-5.54 5.54z"/></svg></button>
        </div>
    `;
    // Set from the DOM (not the template) so the id is never parsed as HTML
    const checkbox = toolOption.querySelector('input[type="checkbox"]');
    const label = toolOption.querySelector("label");
    checkbox.id = `setting_${toolId}`;
    checkbox.checked = isVisible;
    label.htmlFor = checkbox.id;

    const name = getToolLabel(toolId);
    label.textContent = name;
    toolOption.querySelector(".tool-edit")?.setAttribute("aria-label", getTranslation("aiToolEditLabel").replace("{name}", name));
    toolOption.querySelector(".tool-delete")?.setAttribute("aria-label", getTranslation("aiToolDeleteLabel").replace("{name}", name));
    return toolOption;
}

// Function to generate the AI Tools settings form elements
function generateAIToolsForm(settings) {
    aiToolsForm.innerHTML = "";

    settings.forEach(settingItem => {
        const [toolId, isVisible] = parseSetting(settingItem);
        aiToolsForm.appendChild(createToolOption(toolId, isVisible));
    });

    updateReorderButtonStates();
}

// Handles edit, delete and reorder buttons
async function handleAIToolsFormClick(event) {
    const button = event.target.closest("button");
    const toolOption = button?.closest(".ai-tool-option");
    if (!toolOption || button.disabled) return;

    const toolId = toolOption.dataset.toolId;

    if (button.classList.contains("tool-edit")) {
        openAIToolEditor(toolId);
    } else if (button.classList.contains("tool-delete")) {
        customToolsDraft = customToolsDraft.filter(t => t.id !== toolId);
        if (editingToolId === toolId) closeAIToolEditor();
        toolOption.remove();
        updateReorderButtonStates();
        updateAddToolButtonState();
    } else if (button.classList.contains("reorder-up") || button.classList.contains("reorder-down")) {
        if (isReordering) return;

        const isUp = button.classList.contains("reorder-up");
        const sibling = isUp ? toolOption.previousElementSibling : toolOption.nextElementSibling;
        if (!sibling) return;

        isReordering = true;
        try {
            await animateReorder(toolOption, sibling, isUp ? "up" : "down");
        } finally {
            isReordering = false;
        }
    }
}

function updateAddToolButtonState() {
    // Count the draft, not storage: a delete still pending Save already frees a slot for a replacement.
    // If the modal is then cancelled, storage can end up slightly over the limit, which is harmless
    aiToolAddBtn.disabled = customToolsDraft.length >= MAX_CUSTOM_AI_TOOLS;
}

// Live preview of the icon in the editor (debounced, as it may fetch a favicon)
function updateAIToolPreview(immediate = false) {
    clearTimeout(previewTimeoutId);
    previewTimeoutId = setTimeout(() => {
        const url = parseToolUrl(aiToolUrlInput.value) || aiToolUrlInput.value;
        aiToolIconPreview.replaceChildren(
            iconUtils.getLogoHtml(aiToolNameInput.value, url, aiToolIconInput.value)
        );
    }, immediate ? 0 : 300);
}

// Switches between the list ("") and the add/edit ("editor") view, animating the modal height
function setAIToolsView(view) {
    const modal = aiToolsSettingsModal;
    const startHeight = parseFloat(getComputedStyle(modal).height);
    const toolsList = aiToolsForm.parentElement;

    // Measure the new view at its natural height
    clearTimeout(viewTimeoutId);
    modal.style.transition = "none";
    modal.style.height = "";
    if (view) {
        listScrollTop = toolsList.scrollTop;
        modal.dataset.view = view;
    } else if (modal.dataset.view) {
        // Only restore when returning from the editor, a stale value would scroll the list
        delete modal.dataset.view;
        toolsList.scrollTop = listScrollTop;
    }
    const endHeight = parseFloat(getComputedStyle(modal).height);

    const resetStyles = () => {
        modal.style.transition = "";
        modal.style.height = "";
        modal.style.overflow = "";
    };
    if (modal.style.display !== "block" || startHeight === endHeight) {
        resetStyles();
        return;
    }

    modal.style.overflow = "hidden";
    modal.style.height = `${startHeight}px`;
    modal.getBoundingClientRect(); // commit the start height before transitioning
    modal.style.transition = "height 0.3s ease";
    modal.style.height = `${endHeight}px`;
    viewTimeoutId = setTimeout(resetStyles, 320);

    const shownElements = view ? [aiToolEditor] : [toolsList, aiToolAddBtn, document.querySelector(".ai-modal-footer")];
    shownElements.forEach(el => el.animate({ opacity: [0, 1] }, { duration: 250, easing: "ease" }));
}

// Opens the add/edit view (toolId is null when adding)
function openAIToolEditor(toolId = null) {
    const tool = customToolsDraft.find(t => t.id === toolId);
    editingToolId = tool ? tool.id : null;

    aiToolNameInput.value = tool?.name || "";
    aiToolUrlInput.value = tool?.url || "";
    aiToolIconInput.value = tool?.icon || "";
    aiToolUrlInput.classList.remove("invalid");
    aiToolEditorTitle.textContent = getTranslation(tool ? "aiToolEditTitle" : "aiToolAddTitle");
    aiToolEditorSaveBtn.textContent = getTranslation(tool ? "saveAPI" : "aiToolAddConfirm");

    setAIToolsView("editor");
    updateAIToolPreview(true);
    aiToolNameInput.focus();
}

function closeAIToolEditor() {
    editingToolId = null;
    setAIToolsView("");
}

// Saves a single tool to storage right away, without committing other pending changes in the modal
function persistCustomTool(tool) {
    const stored = getCustomTools();
    const index = stored.findIndex(t => t.id === tool.id);
    if (index === -1) stored.push(tool); else stored[index] = tool;

    try {
        localStorage.setItem("aiCustomTools", JSON.stringify(stored));
        return true;
    } catch (error) {
        console.error("Failed to save custom AI tool:", error);
        alertPrompt(getTranslation("iconStorageQuotaMessage"));
        return false;
    }
}

function submitAIToolEditor() {
    const url = parseToolUrl(aiToolUrlInput.value);
    if (!url) {
        aiToolUrlInput.classList.add("invalid");
        aiToolUrlInput.focus();
        return;
    }
    const name = aiToolNameInput.value.trim() || new URL(url).hostname.replace(/^www\./, "");

    // Converts pasted SVG code to a data URL, clears the field if the icon is invalid
    iconUtils.validateIconInput(aiToolIconInput);
    const icon = aiToolIconInput.value.trim();

    const existingTool = customToolsDraft.find(t => t.id === editingToolId);
    const tool = existingTool || { id: `custom_${Date.now().toString(36)}` };
    Object.assign(tool, { name, url, icon });

    if (!persistCustomTool(tool)) return;

    if (existingTool) {
        // Rebuild the row so the label and aria-labels pick up the new name
        const row = aiToolsForm.querySelector(`[data-tool-id="${tool.id}"]`);
        row.replaceWith(createToolOption(tool.id, row.querySelector("input").checked));
        updateReorderButtonStates();
    } else {
        customToolsDraft.push(tool);
        aiToolsForm.appendChild(createToolOption(tool.id, true));
        updateReorderButtonStates();
    }
    applyAIToolsSettings();

    closeAIToolEditor();
    updateAddToolButtonState();

    // Show the new/edited row
    if (!existingTool) {
        const toolsList = aiToolsForm.parentElement;
        toolsList.scrollTop = toolsList.scrollHeight;
    }
}

// Function to show AI Tools settings modal
function showAIToolsSettings() {
    customToolsDraft = getCustomTools();
    closeAIToolEditor();
    updateAddToolButtonState();

    // Generate the form with the saved settings (or defaults)
    generateAIToolsForm(normalizeAIToolsSettings(getSavedAIToolsSettings(), customToolsDraft));

    // Show modal and overlay
    aiToolsSettingsModal.style.display = "block";
    aiToolsSettingsOverlay.style.display = "block";
}

// Function to update the enabled/disabled state of reorder buttons
function updateReorderButtonStates() {
    const toolOptions = document.querySelectorAll(".ai-tool-option");

    toolOptions.forEach((option, index) => {
        const upButton = option.querySelector(".reorder-up");
        const downButton = option.querySelector(".reorder-down");

        if (upButton) {
            // Disable the first up button
            upButton.disabled = index === 0;
        }

        if (downButton) {
            // Disable the last down button
            downButton.disabled = index === toolOptions.length - 1;
        }
    });
}

// Function to close settings modal
function closeAIToolsSettings() {
    aiToolsSettingsModal.style.display = "none";
    aiToolsSettingsOverlay.style.display = "none";
    closeAIToolEditor();
}

// Function to toggle AI Tools panel
let isAIToolsTransitioning = false;

function toggleAITools(event) {
    if (isAIToolsTransitioning) return;
    isAIToolsTransitioning = true;

    const shortcutsCheckbox = document.getElementById("shortcutsCheckbox");
    const isAIToolVisible = aiToolName.style.display === "flex";

    // Prevent outside click handler from triggering
    if (event) event.stopPropagation();

    if (isAIToolVisible) {
        // Hide AI Tool panel
        if (shortcutsCheckbox.checked) {
            shortcuts.style.display = "flex";
        } else {
            shortcuts.style.display = "none";
        }

        delete aiToolsCont.dataset.open;
        aiToolName.classList.remove("show-shortcut-numbers");
        aiToolName.style.opacity = "0";
        aiToolName.style.gap = "0";
        aiToolName.style.transform = "translateX(-100%)";

        setTimeout(() => {
            aiToolName.style.display = "none";
            isAIToolsTransitioning = false;
        }, 500);
    } else {
        // Show AI Tool panel
        shortcuts.style.display = "none";
        aiToolName.style.display = "flex";
        aiToolsCont.dataset.open = "true";

        requestAnimationFrame(() => {
            aiToolName.style.opacity = "1";
            aiToolName.style.transform = "translateX(0)";
        });

        setTimeout(() => {
            aiToolName.style.gap = "12px";
            isAIToolsTransitioning = false;
        }, 300);
    }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", function () {
    // Apply saved settings
    applyAIToolsSettings();

    // Allow horizontal scrolling with the mouse wheel
    aiToolsCont.addEventListener("wheel", (event) => {
        // Check if the container is scrollable in x-axis
        if (aiToolsCont.scrollWidth > aiToolsCont.clientWidth) {
            if (event.deltaY !== 0) {
                event.preventDefault(); // Prevent vertical scrolling
                // Apply the deltaY from the wheel event to horizontal scroll
                aiToolsCont.scrollLeft += event.deltaY;
            }
        }
    }, { passive: false });

    // AI Tools icon click handler
    aiToolsIcon.addEventListener("click", toggleAITools);

    // AI Tools icon right-click handler
    aiToolsIcon.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        e.stopPropagation();
        showAIToolsSettings();
    });

    // AI Tools edit button click handler
    aiToolsEditButton.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        showAIToolsSettings();
    });

    // Close button in settings modal
    closeAISettingsBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        closeAIToolsSettings();
    });

    // Reset button in settings modal
    resetAISettingsBtn.addEventListener("click", function () {
        // Create default settings (custom tools are kept, after the built-in ones)
        closeAIToolEditor();
        const defaultSettings = normalizeAIToolsSettings(null, customToolsDraft);

        // Generate the form with default settings
        generateAIToolsForm(defaultSettings);

        // Animate the list reset
        const toolsList = document.querySelector(".ai-tools-list");
        const toolOptions = document.querySelectorAll(".ai-tool-option");

        // Add shake animation to the entire list
        toolsList.style.animation = "resetShake 0.6s ease-in-out";

        // Staggered fade effect for each option
        toolOptions.forEach((option, index) => {
            setTimeout(() => {
                option.style.animation = "resetFlash 0.4s ease-in-out";

                // Update checkbox during animation
                const toolId = option.dataset.toolId;
                const checkbox = document.getElementById(`setting_${toolId}`);
                const defaultTool = aiTools.find(t => t.id === toolId);

                if (defaultTool && checkbox) {
                    checkbox.checked = defaultTool.visible;
                }
            }, index * 50); // Stagger by 50ms
        });

        // Briefly disable the reset button to prevent multiple clicks
        resetAISettingsBtn.disabled = true;

        // Clean up all animation properties and restore button
        setTimeout(() => {
            toolsList.style.animation = "";
            toolOptions.forEach(option => {
                option.style.animation = "";
                option.style.transform = "";
                option.style.backgroundColor = "";
            });
            resetAISettingsBtn.disabled = false;
        }, 700);
    });

    // Save button in settings modal
    saveAISettingsBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Save custom tools and each tool's visibility based on current order in the form
        try {
            localStorage.setItem("aiCustomTools", JSON.stringify(customToolsDraft));
        } catch (error) {
            console.error("Failed to save custom AI tools:", error);
            alertPrompt(getTranslation("iconStorageQuotaMessage"));
            return;
        }
        saveAIToolsSettings();

        // Apply new settings
        applyAIToolsSettings();

        // Close modal
        closeAIToolsSettings();
    });

    // Settings overlay click handler
    aiToolsSettingsOverlay.addEventListener("click", function (e) {
        e.stopPropagation();
        closeAIToolsSettings();
    });

    // Edit, delete and reorder buttons
    aiToolsForm.addEventListener("click", handleAIToolsFormClick);

    // Add/edit custom tool form
    aiToolAddBtn.addEventListener("click", () => openAIToolEditor());
    aiToolEditorCancelBtn.addEventListener("click", closeAIToolEditor);
    aiToolEditorSaveBtn.addEventListener("click", submitAIToolEditor);
    aiToolUrlInput.addEventListener("input", () => aiToolUrlInput.classList.remove("invalid"));
    [aiToolNameInput, aiToolUrlInput, aiToolIconInput].forEach(input => {
        input.addEventListener("input", () => updateAIToolPreview());
        input.addEventListener("focus", (event) => event.target.select());
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                submitAIToolEditor();
            }
        });
    });

    // Icon: validate pasted URL/SVG on blur, or upload a file
    aiToolIconInput.addEventListener("blur", () => {
        iconUtils.validateIconInput(aiToolIconInput);
        updateAIToolPreview(true);
    });
    aiToolIconUploadBtn.addEventListener("click", () => aiToolIconFileInput.click());
    aiToolIconFileInput.addEventListener("change", async (event) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        const iconValue = await iconUtils.readIconFile(selectedFile);
        aiToolIconFileInput.value = "";
        if (iconValue === null) return;

        aiToolIconInput.value = iconValue;
        updateAIToolPreview(true);
    });

    // Handle checkbox state for AI Tools visibility
    const aiToolsCheckbox = document.getElementById("aiToolsCheckbox");

    aiToolsCheckbox.addEventListener("change", function () {
        saveCheckboxState("aiToolsCheckboxState", aiToolsCheckbox);
        if (aiToolsCheckbox.checked) {
            aiToolsCont.style.display = "flex";
            saveDisplayStatus("aiToolsDisplayStatus", "flex");
            aiToolsEditField.classList.remove("inactive");
        } else {
            aiToolsCont.style.display = "none";
            saveDisplayStatus("aiToolsDisplayStatus", "none");
            aiToolsEditField.classList.add("inactive");
        }
    });

    // Load saved state
    loadCheckboxState("aiToolsCheckboxState", aiToolsCheckbox);
    loadDisplayStatus("aiToolsDisplayStatus", aiToolsCont);
    if (aiToolsCheckbox.checked) {
        aiToolsEditField.classList.remove("inactive");
    } else {
        aiToolsEditField.classList.add("inactive");
    }

    // Collapse when clicking outside toolsCont (but not if settings modal is open)
    document.addEventListener("click", (event) => {
        const isSettingsModalOpen = aiToolsSettingsModal.style.display === "block";
        if (!aiToolName.contains(event.target) && aiToolName.style.display === "flex" && !isSettingsModalOpen) {
            toggleAITools();
        }
    });
});
