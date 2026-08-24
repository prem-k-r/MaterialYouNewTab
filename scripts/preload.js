/*
 * Material You New Tab
 * Copyright (c) 2024-2026 Prem, 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

// ===============================================================
// Preload: Apply saved theme BEFORE first paint to prevent flash
// This script runs synchronously in <head>, before <body> exists.
// ===============================================================

(function () {
    const root = document.documentElement;

    // --- Loading Screen Color ---
    root.style.setProperty(
        '--Loading-Screen-Color',
        localStorage.getItem('LoadingScreenColor') || '#bbd6fd'
    );

    // --- Widget transparency ---
    const savedOpacity = localStorage.getItem('bgOpacity');
    if (savedOpacity) {
        root.style.setProperty('--transparency', `${Math.round(Number(savedOpacity))}%`);
    }

    // Watch for the <body> to be created and instantly set it to "wallpaper" before the screen paints
    // if (localStorage.getItem('hasWallpaper') === 'true') {
    //     const observer = new MutationObserver(function () {
    //         if (document.body) {
    //             document.body.setAttribute('data-bg', 'wallpaper');
    //             observer.disconnect(); // Stop watching once the job is done
    //         }
    //     });
    //     observer.observe(document.documentElement, { childList: true });
    // }

    // --- Light/Dark/System mode preference ---
    const preferredTheme = localStorage.getItem('preferredTheme');
    // Migrate legacy dark mode checkbox
    const legacyDarkCheckbox = localStorage.getItem('enableDarkModeCheckboxState');
    let resolvedPreference = preferredTheme || 'light';

    if (legacyDarkCheckbox === 'checked' && !preferredTheme) {
        resolvedPreference = 'dark';
    }

    // Set data attribute on <html> for CSS early-paint dark mode selectors
    root.setAttribute('data-preferred-theme', resolvedPreference);

    // For system theme: detect if OS is in dark mode
    if (resolvedPreference === 'system') {
        const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-system-dark', systemIsDark ? 'true' : 'false');
    }

    // --- Color theme application ---
    const storedTheme = localStorage.getItem('selectedTheme');
    const storedCustomColor = localStorage.getItem('customThemeColor');

    window.ThemeHelpers = {
        adjustHexColor: function (hex, factor, isLighten = true) {
            hex = hex.replace('#', '');
            if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
            let r = parseInt(hex.substring(0, 2), 16);
            let g = parseInt(hex.substring(2, 4), 16);
            let b = parseInt(hex.substring(4, 6), 16);
            if (isLighten) {
                r = Math.floor(r + (255 - r) * factor);
                g = Math.floor(g + (255 - g) * factor);
                b = Math.floor(b + (255 - b) * factor);
            } else {
                r = Math.floor(r * (1 - factor));
                g = Math.floor(g * (1 - factor));
                b = Math.floor(b * (1 - factor));
            }
            return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase();
        },
        isNearWhite: function (hex, threshold = 240) {
            hex = hex.replace('#', '');
            let r = parseInt(hex.substring(0, 2), 16);
            let g = parseInt(hex.substring(2, 4), 16);
            let b = parseInt(hex.substring(4, 6), 16);
            return r > threshold && g > threshold && b > threshold;
        }
    };

    if (storedCustomColor) {
        // --- Custom color theme ---
        var adjustedColor = window.ThemeHelpers.isNearWhite(storedCustomColor) ? '#696969' : storedCustomColor;

        var lighterColorHex = window.ThemeHelpers.adjustHexColor(adjustedColor, 0.7);
        var lightTin = window.ThemeHelpers.adjustHexColor(adjustedColor, 0.9);
        var darkerColorHex = window.ThemeHelpers.adjustHexColor(adjustedColor, 0.3, false);
        var darkTextColor = window.ThemeHelpers.adjustHexColor(adjustedColor, 0.8, false);

        root.style.setProperty('--bg-color-blue', lighterColorHex);
        root.style.setProperty('--accentLightTint-blue', lightTin);
        root.style.setProperty('--darkerColor-blue', darkerColorHex);
        root.style.setProperty('--darkColor-blue', adjustedColor);
        root.style.setProperty('--textColorDark-blue', darkTextColor);
        root.style.setProperty('--whitishColor-blue', '#ffffff');

    } else if (storedTheme && storedTheme !== 'blue') {
        // --- Predefined theme (not blue, since blue is the CSS default) ---
        var isDarkMode = storedTheme === 'dark';
        var prefix = isDarkMode ? 'dark' : storedTheme;

        root.style.setProperty('--bg-color-blue', 'var(--bg-color-' + prefix + ')');
        root.style.setProperty('--accentLightTint-blue', 'var(--accentLightTint-' + prefix + ')');
        root.style.setProperty('--darkerColor-blue', 'var(--darkerColor-' + prefix + ')');
        root.style.setProperty('--darkColor-blue', 'var(--darkColor-' + prefix + ')');
        root.style.setProperty('--textColorDark-blue', 'var(--textColorDark-' + prefix + ')');

        if (!isDarkMode) {
            root.style.setProperty('--whitishColor-blue', 'var(--whitishColor-' + storedTheme + ')');
        }

        // Add black-theme class for the "dark" color preset
        if (isDarkMode) {
            root.classList.add('black-theme');
        }
    }
})();
