/*
 * Material You NewTab
 * Copyright (c) 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

// --- AI Tools Data and DOM References ---
const AI_TOOLS_DEFAULT = [
    { id: "chatGPT", visible: true },
    { id: "gemini", visible: true },
    { id: "copilot", visible: true },
    { id: "claude", visible: true },
    { id: "deepseek", visible: true },
    { id: "perplexity", visible: false },
    { id: "grok", visible: false },
    { id: "metaAI", visible: false },
    { id: "qwen", visible: false },
    { id: "firefly", visible: false }
];

const aiTools = AI_TOOLS_DEFAULT.map(tool => ({
    ...tool,
    label: translations[currentLanguage]?.[tool.id] || translations["en"][tool.id]
}));

const $ = id => document.getElementById(id);
const aiToolName = $("toolsCont");
const shortcuts = $("shortcutsContainer");
const aiToolsIcon = $("aiToolsIcon");
const aiToolsSettingsModal = $("aiToolsSettingsModal");
const aiToolsSettingsOverlay = $("aiToolsSettingsOverlay");
const aiToolsForm = $("aiToolsForm");
const closeAISettingsBtn = $("closeAISettingsBtn");
const resetAISettingsBtn = $("resetAISettingsBtn");
const saveAISettingsBtn = $("saveAISettingsBtn");
const aiToolsEditButton = $("aiToolsEditButton");
const aiToolsCont = $("aiToolsCont");
const aiToolsEditField = $("aiToolsEditField");

// Animate reorder of AI tool options
function animateReorder(element1, element2, direction) {
    return new Promise(resolve => {
        const rect1 = element1.getBoundingClientRect();
        const rect2 = element2.getBoundingClientRect();
        const distance = Math.abs(rect1.top - rect2.top);
        element1.style.setProperty("--move-distance", `${distance}px`);
        element2.style.setProperty("--move-distance", `${distance}px`);
        [element1, element2].forEach(el => el.style.pointerEvents = "none");
        if (direction === "up") {
            element1.classList.add("reorder-animate-up");
            element2.classList.add("reorder-animate-down");
        } else {
            element1.classList.add("reorder-animate-down");
            element2.classList.add("reorder-animate-up");
        }
        setTimeout(() => {
            updateReorderButtonStates();
        }, 150);
        setTimeout(() => {
            if (direction === "up") {
                aiToolsForm.insertBefore(element1, element2);
            } else {
                aiToolsForm.insertBefore(element2, element1);
            }
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

function saveAIToolsSettings() {
    const settings = Array.from(document.querySelectorAll(".ai-tool-option")).map(option => {
        const toolId = option.dataset.toolId;
        const isVisible = $("setting_" + toolId).checked;
        return isVisible ? toolId : { [toolId]: false };
    });
    localStorage.setItem("aiToolsSettings", JSON.stringify(settings));
}

function applyAIToolsSettings() {
    let settings = JSON.parse(localStorage.getItem("aiToolsSettings") || "null");
    if (!settings || !Array.isArray(settings)) {
        settings = aiTools.map(tool => tool.visible ? tool.id : { [tool.id]: false });
        localStorage.setItem("aiToolsSettings", JSON.stringify(settings));
    }
    const toolElements = new Map();
    aiToolName.querySelectorAll("a").forEach(link => {
        const toolId = [...link.children].find(el => aiTools.some(t => t.id === el.id))?.id;
        if (toolId) toolElements.set(toolId, link);
    });
    aiToolName.innerHTML = "";
    settings.forEach(item => {
        let toolId, isVisible;
        if (typeof item === "string") {
            toolId = item;
            isVisible = true;
        } else {
            toolId = Object.keys(item)[0];
            isVisible = false;
        }
        const toolElement = toolElements.get(toolId);
        if (toolElement) {
            toolElement.style.display = isVisible ? "flex" : "none";
            aiToolName.appendChild(toolElement);
        }
    });
}

function generateAIToolsForm(settings) {
    aiToolsForm.innerHTML = "";
    settings.forEach((item, idx) => {
        let toolId, isVisible;
        if (typeof item === "string") {
            toolId = item;
            isVisible = true;
        } else {
            toolId = Object.keys(item)[0];
            isVisible = false;
        }
        const tool = aiTools.find(t => t.id === toolId);
        const toolLabel = tool?.label || toolId;
        const toolOption = document.createElement("div");
        toolOption.className = "ai-tool-option";
        toolOption.dataset.toolId = toolId;
        toolOption.innerHTML = `
            <div class="ai-tool-controls">
                <input type="checkbox" id="setting_${toolId}" ${isVisible ? "checked" : ""}>
                <label for="setting_${toolId}">${toolLabel}</label>
            </div>
            <div class="ai-tool-reorder">
                <button type="button" class="reorder-up" ${idx === 0 ? "disabled" : ""}>▲</button>
                <button type="button" class="reorder-down" ${idx === settings.length - 1 ? "disabled" : ""}>▼</button>
            </div>
        `;
        aiToolsForm.appendChild(toolOption);
    });
    aiToolsForm.addEventListener("click", async event => {
        const upBtn = event.target.closest(".reorder-up");
        const downBtn = event.target.closest(".reorder-down");
        if (!upBtn && !downBtn) return;
        const toolOption = event.target.closest(".ai-tool-option");
        if (!toolOption || event.target.disabled || event.target.dataset.animating === "true") return;
        event.target.dataset.animating = "true";
        if (upBtn) {
            const prev = toolOption.previousElementSibling;
            if (prev) await animateReorder(toolOption, prev, "up");
        } else if (downBtn) {
            const next = toolOption.nextElementSibling;
            if (next) await animateReorder(toolOption, next, "down");
        }
        event.target.dataset.animating = "false";
    });
    updateReorderButtonStates();
}

function showAIToolsSettings() {
    aiToolsForm.innerHTML = "";
    let saved = JSON.parse(localStorage.getItem("aiToolsSettings") || "null");
    if (!saved || !Array.isArray(saved)) {
        saved = aiTools.map(tool => tool.visible ? tool.id : { [tool.id]: false });
    }
    generateAIToolsForm(saved);
    aiToolsSettingsModal.style.display = "block";
    aiToolsSettingsOverlay.style.display = "block";
}

function updateReorderButtonStates() {
    const options = document.querySelectorAll(".ai-tool-option");
    options.forEach((option, idx) => {
        const up = option.querySelector(".reorder-up");
        const down = option.querySelector(".reorder-down");
        if (up) up.disabled = idx === 0;
        if (down) down.disabled = idx === options.length - 1;
    });
}

function closeAIToolsSettings() {
    aiToolsSettingsModal.style.display = "none";
    aiToolsSettingsOverlay.style.display = "none";
}

function toggleAITools(event) {
    const shortcutsCheckbox = $("shortcutsCheckbox");
    const isVisible = aiToolName.style.display === "flex";
    if (event) event.stopPropagation();
    if (isVisible) {
        shortcuts.style.display = shortcutsCheckbox.checked ? "flex" : "none";
        aiToolName.style.opacity = "0";
        aiToolName.style.gap = "0";
        aiToolName.style.transform = "translateX(-100%)";
        setTimeout(() => { aiToolName.style.display = "none"; }, 500);
    } else {
        shortcuts.style.display = "none";
        aiToolName.style.display = "flex";
        setTimeout(() => {
            aiToolName.style.opacity = "1";
            aiToolName.style.transform = "translateX(0)";
        }, 1);
        setTimeout(() => { aiToolName.style.gap = "12px"; }, 300);
    }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    applyAIToolsSettings();
    aiToolsCont.addEventListener("wheel", event => {
        if (aiToolsCont.scrollWidth > aiToolsCont.clientWidth && event.deltaY !== 0) {
            event.preventDefault();
            aiToolsCont.scrollLeft += event.deltaY;
        }
    }, { passive: false });
    aiToolsIcon.addEventListener("click", toggleAITools);
    aiToolsEditButton.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        showAIToolsSettings();
    });
    closeAISettingsBtn.addEventListener("click", closeAIToolsSettings);
    resetAISettingsBtn.addEventListener("click", () => {
        const defaults = aiTools.map(tool => tool.visible ? tool.id : { [tool.id]: false });
        generateAIToolsForm(defaults);
        const toolsList = document.querySelector(".ai-tools-list");
        const toolOptions = document.querySelectorAll(".ai-tool-option");
        if (toolsList) toolsList.style.animation = "resetShake 0.6s ease-in-out";
        toolOptions.forEach((option, idx) => {
            setTimeout(() => {
                option.style.animation = "resetFlash 0.4s ease-in-out";
                const toolId = option.dataset.toolId;
                const checkbox = $("setting_" + toolId);
                const defTool = aiTools.find(t => t.id === toolId);
                if (defTool && checkbox) checkbox.checked = defTool.visible;
            }, idx * 50);
        });
        resetAISettingsBtn.disabled = true;
        setTimeout(() => {
            if (toolsList) toolsList.style.animation = "";
            toolOptions.forEach(option => {
                option.style.animation = "";
                option.style.transform = "";
                option.style.backgroundColor = "";
            });
            resetAISettingsBtn.disabled = false;
        }, 700);
    });
    saveAISettingsBtn.addEventListener("click", () => {
        const newSettings = Array.from(document.querySelectorAll(".ai-tool-option")).map(option => {
            const toolId = option.dataset.toolId;
            const isVisible = $("setting_" + toolId).checked;
            return isVisible ? toolId : { [toolId]: false };
        });
        localStorage.setItem("aiToolsSettings", JSON.stringify(newSettings));
        applyAIToolsSettings();
        closeAIToolsSettings();
    });
    aiToolsSettingsOverlay.addEventListener("click", closeAIToolsSettings);
    const aiToolsCheckbox = $("aiToolsCheckbox");
    aiToolsCheckbox.addEventListener("change", function () {
        saveCheckboxState("aiToolsCheckboxState", aiToolsCheckbox);
        if (aiToolsCheckbox.checked) {
            aiToolsCont.style.display = "flex";
            saveDisplayStatus("aiToolsDisplayStatus", "flex");
            aiToolsEditField.classList.remove("inactive");
            showAIToolsSettings();
        } else {
            aiToolsCont.style.display = "none";
            saveDisplayStatus("aiToolsDisplayStatus", "none");
            aiToolsEditField.classList.add("inactive");
        }
    });
    loadCheckboxState("aiToolsCheckboxState", aiToolsCheckbox);
    loadDisplayStatus("aiToolsDisplayStatus", aiToolsCont);
    if (aiToolsCheckbox.checked) {
        aiToolsEditField.classList.remove("inactive");
    } else {
        aiToolsEditField.classList.add("inactive");
    }
    document.addEventListener("click", event => {
        if (!aiToolName.contains(event.target) && aiToolName.style.display === "flex") {
            toggleAITools();
        }
    });
});
