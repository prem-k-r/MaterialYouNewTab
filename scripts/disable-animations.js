/*
 * Material You NewTab
 * Copyright (c) 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

// Apply animation state immediately BEFORE page loads to prevent flash of animations
(function() {
    const isDisabled = localStorage.getItem("disableAnimations") === "true";
    console.log("Disable Animations - Initial Load:", isDisabled);
    if (isDisabled) {
        document.documentElement.classList.add("no-animations");
        console.log("✅ Added no-animations class to html element");
    }
})();

// Disable Animations Feature - Toggle Handler
document.addEventListener("DOMContentLoaded", function () {
    const disableAnimationsCheckbox = document.getElementById("disableAnimationsCheckbox");
    
    if (!disableAnimationsCheckbox) {
        console.error("❌ Disable animations checkbox not found");
        return;
    }
    
    console.log("✅ Checkbox found!");
    
    // Retrieve saved state from localStorage (default: false if null)
    const savedState = localStorage.getItem("disableAnimations") === "true";
    disableAnimationsCheckbox.checked = savedState;
    
    console.log("Current state from localStorage:", savedState);
    console.log("HTML element has no-animations class:", document.documentElement.classList.contains("no-animations"));
    
    // Listen for checkbox changes
    disableAnimationsCheckbox.addEventListener("change", () => {
        const isChecked = disableAnimationsCheckbox.checked;
        console.log("Toggle changed to:", isChecked);
        localStorage.setItem("disableAnimations", isChecked);
        applyAnimationState(isChecked);
    });
    
    /**
     * Apply or remove the no-animations class based on user preference
     * @param {boolean} isDisabled - Whether animations should be disabled
     */
    function applyAnimationState(isDisabled) {
        if (isDisabled) {
            document.documentElement.classList.add("no-animations");
            console.log("✅ Added no-animations class");
        } else {
            document.documentElement.classList.remove("no-animations");
            console.log("✅ Removed no-animations class");
        }
        console.log("HTML classes:", document.documentElement.className);
    }
});
