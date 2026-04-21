/*
 * Material You NewTab
 * Copyright (c) 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

// Set Loading Screen Color before Everything Loads
document.documentElement.style.setProperty('--Loading-Screen-Color', localStorage.getItem('LoadingScreenColor') || "#000000ff");

// Early dark mode detection to prevent light→dark flash
// The CSS dark mode filter (invert + hue-rotate) normally depends on DOM elements
// that don't exist yet. Pre-apply the filter on <html> so the loading screen
// matches the dark mode appearance from the first paint.
(function () {
    const preferredTheme = localStorage.getItem('preferredTheme');
    const selectedTheme = localStorage.getItem('selectedTheme');
    const savedBgType = localStorage.getItem('bgType');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const isDarkMode = preferredTheme === 'dark' || (preferredTheme === 'system' && systemDark);
    const isColorBg = savedBgType !== 'wallpaper'; // default to color if not saved
    const isBlackTheme = selectedTheme === 'dark';

    if (isDarkMode && isColorBg && !isBlackTheme) {
        document.documentElement.classList.add('early-dark-filter');
    }
})();
