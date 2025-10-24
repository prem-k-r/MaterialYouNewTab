/*
 * Material You NewTab
 * Copyright (c) 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

// Disable Animations Feature
document.addEventListener("DOMContentLoaded", function () {
    const disableAnimationsCheckbox = document.getElementById("disableAnimationsCheckbox");
    
    if (!disableAnimationsCheckbox) {
        console.error("Disable animations checkbox not found");
        return;
    }
    
    // Retrieve saved state from localStorage (default: false if null)
    const savedState = localStorage.getItem("disableAnimations") === "true";
    disableAnimationsCheckbox.checked = savedState;
    
    // Apply initial state immediately to prevent flash of animations
    applyAnimationState(savedState);
    
    // Listen for checkbox changes
    disableAnimationsCheckbox.addEventListener("change", () => {
        const isChecked = disableAnimationsCheckbox.checked;
        localStorage.setItem("disableAnimations", isChecked);
        applyAnimationState(isChecked);
    });
    
    /**
     * Apply or remove the no-animations class based on user preference
     * @param {boolean} isDisabled - Whether animations should be disabled
     */
    function applyAnimationState(isDisabled) {
        if (isDisabled) {
            document.body.classList.add("no-animations");
        } else {
            document.body.classList.remove("no-animations");
        }
    }
});
