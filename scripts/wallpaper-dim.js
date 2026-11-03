/*
 * Material You New Tab
 * Copyright (c) 2024-2026 Prem, 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

// -------------------------- Wallpaper Dim -----------------------------
// Adds a colored, semi-transparent layer between the wallpaper and the widgets.
// The overlay itself is drawn in CSS (see body[data-bg="wallpaper"] in style.css);
// this script only drives the slider/color picker and stores the values.

const DIM_MAX = 80;             // Maximum dim strength in percent
const DIM_SLIDER_OFFSET = 20;   // Slider always keeps 20% width so the label stays readable
const DIM_DEFAULT_COLOR = "#000000";

const dimBar = document.getElementById("dimBar");
const dimSlider = document.getElementById("dimSlider");
const dimLevel = document.getElementById("dimLevel");
const dimColorPicker = document.getElementById("dimColorPicker");
const dimColorSwatch = document.getElementById("dimColorSwatch");

/**
 * Sets the dim strength, updates the slider UI and the CSS variable, and saves it.
 *
 * @param {number} dim - Dim strength in percent; clamped to 0–DIM_MAX.
 * @returns {void}
 */
function setDimLevel(dim) {
    const value = Math.round(Math.min(DIM_MAX, Math.max(0, dim)));
    dimSlider.style.width = `${value + DIM_SLIDER_OFFSET}%`;
    dimLevel.textContent = `${localizeNumbers(value.toString(), currentLanguage)}%`;
    document.documentElement.style.setProperty("--wallpaper-dim-opacity", `${value}%`);
    localStorage.setItem("wallpaperDimOpacity", value);
}

/**
 * Sets the dim overlay color, updates the swatch and the CSS variable, and saves it.
 *
 * @param {string} color - Hex color, e.g. "#000000".
 * @returns {void}
 */
function setDimColor(color) {
    const value = /^#[0-9a-f]{6}$/i.test(color) ? color : DIM_DEFAULT_COLOR;
    dimColorPicker.value = value;
    dimColorSwatch.style.backgroundColor = value;
    document.documentElement.style.setProperty("--wallpaper-dim-color", value);
    localStorage.setItem("wallpaperDimColor", value);
}

/**
 * Converts a pointer position on the dim bar into a dim level and applies it.
 * Supports mouse and touch events and respects RTL layouts.
 *
 * @param {MouseEvent|TouchEvent} e - The pointer event.
 * @returns {void}
 */
function handleDimDrag(e) {
    const clientX = e.type.startsWith("touch") ? e.touches[0].clientX : e.clientX;
    const rect = dimBar.getBoundingClientRect();
    let pos = isRTL ? rect.right - clientX : clientX - rect.left;
    pos = Math.max(0, Math.min(rect.width, pos));
    const percentage = (pos / rect.width) * 100;
    setDimLevel(percentage - DIM_SLIDER_OFFSET);
}

// Click or touch on bar: move slider and keep following the pointer until release
["mousedown", "touchstart"].forEach(evt => {
    dimBar.addEventListener(evt, e => {
        e.preventDefault();
        handleDimDrag(e);

        const onMove = ev => handleDimDrag(ev);
        const onEnd = () => {
            ["mousemove", "touchmove"].forEach(m => document.removeEventListener(m, onMove));
            ["mouseup", "touchend"].forEach(m => document.removeEventListener(m, onEnd));
        };
        ["mousemove", "touchmove"].forEach(m => document.addEventListener(m, onMove));
        ["mouseup", "touchend"].forEach(m => document.addEventListener(m, onEnd));
    }, { passive: false });
});

// Live-update while picking, save on every change
dimColorPicker.addEventListener("input", e => setDimColor(e.target.value));

// Hover text for the color swatch (reuses the existing "Pick color" string)
dimColorSwatch.title = translations[currentLanguage]?.rangColor || translations["en"].rangColor;

// Initialize from saved values (default: off, black)
setDimLevel(Number(localStorage.getItem("wallpaperDimOpacity")) || 0);
setDimColor(localStorage.getItem("wallpaperDimColor") || DIM_DEFAULT_COLOR);
