/*
 * Material You New Tab
 * Copyright (c) 2024-2026 Prem, 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */


// Disable Open Animations toggle: toggle the "no-open-animations"
// class on <html>. preload.js applies it pre-paint to avoid a flash.
const disableAnimationsKey = "disableOpenAnimations";
const disableAnimationsCheckbox = document.getElementById("disableAnimations");

function applyDisableAnimations(isDisabled) {
    document.documentElement.classList.toggle("no-open-animations", isDisabled);
}

const animationsDisabled = localStorage.getItem(disableAnimationsKey) === "true";
disableAnimationsCheckbox.checked = animationsDisabled;
applyDisableAnimations(animationsDisabled);

disableAnimationsCheckbox.addEventListener("change", function () {
    const isDisabled = disableAnimationsCheckbox.checked;
    localStorage.setItem(disableAnimationsKey, isDisabled);
    applyDisableAnimations(isDisabled);
});
