/*
 * Material You NewTab
 * Copyright (c) 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

/* ------ Helper functions for saving and loading states ------ */

// Function to save checkbox state to Storage
function saveCheckboxState(key, checkbox) {
    Storage.setItem(key, checkbox.checked ? "checked" : "unchecked");
}

const bookmarkGridCheckbox = document.getElementById("bookmarkGridCheckbox");
// Function to load and apply checkbox state from Storage
function loadCheckboxState(key, checkbox) {
    const savedState = Storage.getItem(key);
    checkbox.checked = savedState === "checked";
    if (key === "bookmarkGridCheckboxState") {
        if (!savedState) {
            bookmarkGridCheckbox.click();
        } else {
            bookmarkGridCheckbox.click();
            bookmarkGridCheckbox.click();
        }
    }
}

// Function to save display status to Storage
function saveDisplayStatus(key, displayStatus) {
    Storage.setItem(key, displayStatus);
}

// Function to load and apply display status from Storage
function loadDisplayStatus(key, element) {
    const savedStatus = Storage.getItem(key);
    if (savedStatus === "flex") {
        element.style.display = "flex";
    } else {
        element.style.display = "none";
    }
}

// Function to save activeness status to Storage
function saveActiveStatus(key, activeStatus) {
    Storage.setItem(key, activeStatus);
}

// Function to load and apply activeness status from Storage
function loadActiveStatus(key, element) {
    const savedStatus = Storage.getItem(key);
    if (savedStatus === "active") {
        element.classList.remove("inactive");
    } else {
        element.classList.add("inactive");
    }
}
