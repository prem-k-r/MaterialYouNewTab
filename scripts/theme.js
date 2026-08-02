/*
 * Material You New Tab
 * Copyright (c) 2024-2026 Prem, 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 */

const themeStorageKey = "selectedTheme";
const customThemeStorageKey = "customThemeColor";
const darkModeCheckboxKey = "enableDarkModeCheckboxState";
const storedTheme = localStorage.getItem(themeStorageKey);
const storedCustomColor = localStorage.getItem(customThemeStorageKey);
const radioButtons = document.querySelectorAll(".colorPlate");
const colorPicker = document.getElementById("colorPicker");
const colorPickerLabel = document.getElementById("rangColor");

// MediaQuery for system theme detection
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

const syncThemeChange = (MediaQuery) => {
    document.body.setAttribute("sysTheme", MediaQuery.matches ? "systemDark" : "systemLight");
}

// Initialize system theme attribute immediately
syncThemeChange(systemTheme);

// ===== Segmented Control for Dark Mode =====
(function () {
    const preferredThemeKey = "preferredTheme";
    const segment = document.getElementById("themeSegment");
    const indicator = segment.querySelector(".themeIndicator");
    const buttons = segment.querySelectorAll(".themeSegBtn");

    // Move indicator to correct position
    function moveIndicator(theme) {
        const ltrIndex = theme === "light" ? 0 : theme === "dark" ? 1 : 2;
        // If RTL, reverse the index
        const index = isRTL ? 2 - ltrIndex : ltrIndex;
        indicator.style.transform = `translateX(${index * 100}%)`;
    }

    // Apply theme mode (light/dark/system)
    function applyThemeMode(theme) {
        localStorage.setItem(preferredThemeKey, theme);
        segment.dataset.active = theme;
        moveIndicator(theme);

        // Update sysTheme attribute when system mode is selected
        if (theme === "system") {
            syncThemeChange(systemTheme);
        }
    }

    // Button click handlers
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            applyThemeMode(btn.dataset.theme);
        });
    });

    // System theme change listener
    systemTheme.addEventListener('change', syncThemeChange);

    function initializeThemeMode() {
        const darkModeCheckboxState = localStorage.getItem(darkModeCheckboxKey);
        const savedPreferredTheme = localStorage.getItem(preferredThemeKey);

        let initialTheme;

        if (darkModeCheckboxState === "checked") {
            // Migrate old checkbox users to "dark" mode
            initialTheme = "dark";
            localStorage.removeItem(darkModeCheckboxKey);
            localStorage.setItem(preferredThemeKey, "dark");
        } else if (savedPreferredTheme) {
            initialTheme = savedPreferredTheme; // Use saved preference
        } else {
            initialTheme = "light"; // First time user
        }

        applyThemeMode(initialTheme);
    }

    // Initialize
    initializeThemeMode();
})();

document.addEventListener("DOMContentLoaded", () => {
    // Check for custom color
    const storedCustomColor = localStorage.getItem(customThemeStorageKey);
    if (storedCustomColor) {
        applyCustomTheme(storedCustomColor);
        // Uncheck all radio buttons
        radioButtons.forEach(radio => {
            radio.checked = false;
        });
    }
    // Check for regular theme
    else {
        const storedTheme = localStorage.getItem(themeStorageKey);
        if (storedTheme) {
            applySelectedTheme(storedTheme);
            const selectedRadioButton = document.querySelector(`.colorPlate[value="${storedTheme}"]`);
            if (selectedRadioButton) {
                selectedRadioButton.checked = true;
            }
        }
    }

    // Remove Loading Screen when the DOM and the theme has loaded
    document.getElementById("LoadingScreen").style.display = "none";

    // Clean up preload data attributes — DOM-based selectors are now in control
    document.documentElement.removeAttribute("data-preferred-theme");
    document.documentElement.removeAttribute("data-system-dark");

    // Stop blinking of some elements when the page is reloaded
    setTimeout(() => {
        document.documentElement.classList.add("theme-transition");
    }, 25);
});

// Function to load background color 
function ApplyLoadingColor() {
    let LoadingScreenColor = getComputedStyle(document.body).getPropertyValue("background-color");
    localStorage.setItem("LoadingScreenColor", LoadingScreenColor);
}

const resetDarkTheme = () => {
    // Remove the dark theme class
    document.documentElement.classList.remove("black-theme");
};

// Function to apply the selected theme
const applySelectedTheme = (colorValue) => {
    const isDarkMode = colorValue === "dark";

    // Reset dark theme if not in dark mode
    if (!isDarkMode) resetDarkTheme();

    // Reset color picker label border when switching to predefined theme
    colorPickerLabel.style.borderColor = "";

    // Set CSS variables based on the selected color theme
    if (colorValue === "blue") {
        document.documentElement.style.setProperty("--bg-color-blue", "#BBD6FD");
        document.documentElement.style.setProperty("--accentLightTint-blue", "#E2EEFF");
        document.documentElement.style.setProperty("--darkerColor-blue", "#3569B2");
        document.documentElement.style.setProperty("--darkColor-blue", "#4382EC");
        document.documentElement.style.setProperty("--textColorDark-blue", "#1B3041");
        document.documentElement.style.setProperty("--whitishColor-blue", "#ffffff");
    } else {
        const prefix = isDarkMode ? "dark" : colorValue;
        document.documentElement.style.setProperty("--bg-color-blue", `var(--bg-color-${prefix})`);
        document.documentElement.style.setProperty("--accentLightTint-blue", `var(--accentLightTint-${prefix})`);
        document.documentElement.style.setProperty("--darkerColor-blue", `var(--darkerColor-${prefix})`);
        document.documentElement.style.setProperty("--darkColor-blue", `var(--darkColor-${prefix})`);
        document.documentElement.style.setProperty("--textColorDark-blue", `var(--textColorDark-${prefix})`);

        if (!isDarkMode) {
            document.documentElement.style.setProperty("--whitishColor-blue", `var(--whitishColor-${colorValue})`);
        }
    }

    // Handle dark mode specific changes
    if (isDarkMode) {
        document.documentElement.classList.add("black-theme");
    }

    changeFaviconColor();
    ApplyLoadingColor();
};

function changeFaviconColor() {
    // Fetch colors from CSS variables
    const rootStyles = getComputedStyle(document.documentElement);
    const darkColor = rootStyles.getPropertyValue("--darkColor-blue");
    //const bgColor = rootStyles.getPropertyValue("--bg-color-blue");
    let accentLightTintColor = rootStyles.getPropertyValue("--accentLightTint-blue");
    localStorage.setItem("accentLightTintColor", accentLightTintColor);

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path fill="${darkColor}" style="transform: scale(1.2); transform-origin: center;"
            d="M10 19v-5h4v5c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-7h1.7c.46 0 .68-.57.33-.87L12.67 3.6c-.38-.34-.96-.34-1.34 0l-8.36 7.53c-.34.3-.13.87.33.87H5v7c0 .55.45 1 1 1h3c.55 0 1-.45 1-1" />
    </svg>
    `;
    const encodedSvg = 'data:image/svg+xml,' + encodeURIComponent(svg);
    const favicon = document.getElementById("favicon");
    favicon.href = encodedSvg;
    favicon.setAttribute('type', 'image/svg+xml');
}
changeFaviconColor();

// --------------------- Color Picker ---------------------
const applyCustomTheme = (color) => {
    let adjustedColor = window.ThemeHelpers.isNearWhite(color) ? "#696969" : color;

    const lighterColorHex = window.ThemeHelpers.adjustHexColor(adjustedColor, 0.7);
    const lightTin = window.ThemeHelpers.adjustHexColor(adjustedColor, 0.9);
    const darkerColorHex = window.ThemeHelpers.adjustHexColor(adjustedColor, 0.3, false);
    const darkTextColor = window.ThemeHelpers.adjustHexColor(adjustedColor, 0.8, false);

    document.documentElement.style.setProperty("--bg-color-blue", lighterColorHex);
    document.documentElement.style.setProperty("--accentLightTint-blue", lightTin);
    document.documentElement.style.setProperty("--darkerColor-blue", darkerColorHex);
    document.documentElement.style.setProperty("--darkColor-blue", adjustedColor);
    document.documentElement.style.setProperty("--textColorDark-blue", darkTextColor);
    document.documentElement.style.setProperty("--whitishColor-blue", "#ffffff");
    colorPickerLabel.style.borderColor = color;
    document.getElementById("dfChecked").checked = false;

    changeFaviconColor();
    ApplyLoadingColor();
};

// Handle radio button changes
const handleThemeChange = function () {
    if (this.checked) {
        const colorValue = this.value;
        localStorage.setItem(themeStorageKey, colorValue);
        localStorage.removeItem(customThemeStorageKey); // Clear custom theme
        applySelectedTheme(colorValue);
    }
};

// Remove any previously attached listeners and add only one
radioButtons.forEach(radioButton => {
    radioButton.removeEventListener("change", handleThemeChange); // Remove if already attached
    radioButton.addEventListener("change", handleThemeChange);    // Add fresh listener
});

// Handle color picker changes
const handleColorPickerChange = function (event) {
    const selectedColor = event.target.value;
    resetDarkTheme(); // Clear dark theme if active
    localStorage.setItem(customThemeStorageKey, selectedColor); // Save custom color
    localStorage.removeItem(themeStorageKey); // Clear predefined theme
    applyCustomTheme(selectedColor);

    // Uncheck all radio buttons
    radioButtons.forEach(radio => {
        radio.checked = false;
    });
};

// Throttle for performance optimization
const throttle = (func, limit) => {
    let lastFunc;
    let lastRan;
    return (...args) => {
        if (!lastRan) {
            func(...args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(() => {
                if (Date.now() - lastRan >= limit) {
                    func(...args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
};

// Add listeners for color picker
colorPicker.removeEventListener("input", handleColorPickerChange); // Ensure no duplicate listeners
colorPicker.addEventListener("input", throttle(handleColorPickerChange, 10));