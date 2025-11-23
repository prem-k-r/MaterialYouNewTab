/*
 * Material You NewTab
 * Copyright (c) 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

// ------------------------------------ Tips ------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    // Hide tips that are not relevant to mobile
    if (!isDesktop) {
        document.querySelectorAll('.hideOnMobile').forEach(el => el.style.display = 'none');
    }

    // Determine the correct key for adjustZoomInfo based on OS
    const adjustZoomInfo = document.getElementById("adjustZoomInfo");
    let adjustZoomInfoText = translations[currentLanguage]?.adjustZoomInfo || translations["en"].adjustZoomInfo;
    if (isMac) {
        adjustZoomInfoText = adjustZoomInfoText.replace(/Ctrl/g, "⌘");
    }
    adjustZoomInfo.textContent = adjustZoomInfoText;

    // Change browser theme info based on the user's browser
    const changeBrowserThemeInfo = document.getElementById("changeBrowserThemeInfo");
    if (isFirefoxAll) {
        changeBrowserThemeInfo.innerHTML = translations[currentLanguage]?.firefoxThemeInfo || translations["en"].firefoxThemeInfo;
    } else if (isEdge) {
        changeBrowserThemeInfo.innerHTML = translations[currentLanguage]?.edgeThemeInfo || translations["en"].edgeThemeInfo;
    } else if (isBrave) {
        changeBrowserThemeInfo.innerHTML = translations[currentLanguage]?.braveThemeInfo || translations["en"].braveThemeInfo;
    } else {
        changeBrowserThemeInfo.innerHTML = translations[currentLanguage]?.chromeThemeInfo || translations["en"].chromeThemeInfo;
    }

    const firefoxHomepage = document.getElementById("firefoxHomepage");
    const updateFirefoxHomepageInfo = document.getElementById("updateFirefoxHomepageInfo");
    if (isFirefox) {
        firefoxHomepage.style.display = "block";
        updateFirefoxHomepageInfo.innerHTML = translations[currentLanguage]?.updateFirefoxHomepageInfo || translations["en"].updateFirefoxHomepageInfo;
    }

    // Hide tips
    const tips = document.getElementById("tips");
    const dontShowButton = document.getElementById("dontShowTips");

    // Check if the user has previously disabled tips
    if (localStorage.getItem("hideTips") === "true") {
        tips.style.display = "none";
    }

    // Hide tips and save preference when button is clicked
    dontShowButton.addEventListener("click", function () {
        tips.style.display = "none";
        localStorage.setItem("hideTips", "true"); // Save preference
    });
});


// ------------------------------- Footer Toast -------------------------------
(function () {
    if (isFirefoxAll || !isDesktop) return; // Don't show on Firefox or mobile

    const TOAST_DURATION = 30 * 1000; // 30 seconds
    const STORAGE_KEY = 'chrome-footer-toast-shown';

    const toast = document.getElementById('chromeFooterToast');
    const progressBar = document.getElementById('toastProgressBar');
    const closeBtn = document.getElementById('toastClose');

    let progressInterval;
    let elapsedTime = 0;
    let lastTick = 0;
    let isPaused = false;

    function showToast() {
        // Check if toast has been shown before
        const hasShown = localStorage.getItem(STORAGE_KEY);
        if (hasShown) return;

        // Mark as shown
        localStorage.setItem(STORAGE_KEY, 'true');

        // Show toast after brief delay
        setTimeout(() => {
            toast.classList.add('show');
            startProgress();
        }, 1500);
    }

    function hideToast() {
        toast.classList.remove('show');
        clearInterval(progressInterval);
    }

    function startProgress() {
        lastTick = Date.now();

        progressInterval = setInterval(() => {
            if (isPaused) return;

            const now = Date.now();
            elapsedTime += now - lastTick;
            lastTick = now;

            const remaining = Math.max(0, 100 - (elapsedTime / TOAST_DURATION) * 100);

            progressBar.style.width = remaining + '%';

            if (elapsedTime >= TOAST_DURATION) {
                hideToast();
            }
        }, 50);
    }

    // Hover pause
    toast.addEventListener('mouseenter', () => {
        isPaused = true;
    });

    toast.addEventListener('mouseleave', () => {
        isPaused = false;
        lastTick = Date.now();
    });

    closeBtn.addEventListener('click', hideToast);

    showToast();
})();
