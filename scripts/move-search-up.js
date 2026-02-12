/*
 * Material You NewTab
 * Copyright (c) 2024-2026 Prem, 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

document.addEventListener("DOMContentLoaded", function () {
    const moveSearchUpCheckbox = document.getElementById("moveSearchUpCheckbox");
    const centerDiv = document.querySelector(".centerDiv");
    
    const hideClockCheckbox = document.getElementById("hideClock");
    const hideWeatherCheckbox = document.getElementById("hideWeatherCheckbox");
    const hideSearchWithCheckbox = document.getElementById("shortcut_switchcheckbox");

    // Load saved state
    const isMoveSearchUpEnabled = localStorage.getItem("moveSearchUpEnabled") === "true";
    moveSearchUpCheckbox.checked = isMoveSearchUpEnabled;

    // Function to check if all required conditions are met
    function checkConditions() {
        const clockHidden = hideClockCheckbox.checked;
        const weatherHidden = hideWeatherCheckbox.checked;
        const searchEnginesHidden = hideSearchWithCheckbox.checked;
        
        return clockHidden && weatherHidden && searchEnginesHidden;
    }

    // Function to apply the search bar position
    function applySearchPosition() {
        if (moveSearchUpCheckbox.checked && checkConditions()) {
            centerDiv.classList.add("search-moved-up");
        } else {
            centerDiv.classList.remove("search-moved-up");
        }
    }

    // Initial state
    applySearchPosition();

    // Event listener for move search up checkbox
    moveSearchUpCheckbox.addEventListener("change", function () {
        const isEnabled = moveSearchUpCheckbox.checked;
        
        if (isEnabled) {
            // When enabled, automatically hide clock, weather, and search engines
            if (!hideClockCheckbox.checked) {
                hideClockCheckbox.click();
            }
            if (!hideWeatherCheckbox.checked) {
                hideWeatherCheckbox.click();
            }
            if (!hideSearchWithCheckbox.checked) {
                hideSearchWithCheckbox.click();
            }
        }
        
        localStorage.setItem("moveSearchUpEnabled", isEnabled);
        applySearchPosition();
    });

    // Event listeners for condition checkboxes
    // If any of the three is unchecked (shown), automatically disable move search up
    [hideClockCheckbox, hideWeatherCheckbox, hideSearchWithCheckbox].forEach(checkbox => {
        checkbox.addEventListener("change", function () {
            if (!checkbox.checked && moveSearchUpCheckbox.checked) {
                moveSearchUpCheckbox.checked = false;
                localStorage.setItem("moveSearchUpEnabled", "false");
            }
            applySearchPosition();
        });
    });
});
