/*
 * Material You NewTab
 * Copyright (c) 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

// Set Loading Screen Color before Everything Loads
document.documentElement.style.setProperty('--Loading-Screen-Color', localStorage.getItem('LoadingScreenColor') || "#bbd6fd");

// Apply the "disable open animations" preference before paint to avoid a flash
if (localStorage.getItem('disableOpenAnimations') === "true") {
    document.documentElement.classList.add("no-open-animations");
}
