/*
 * Material You New Tab
 * Copyright (c) 2024-2026 Prem, 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

// Translation data
const translations = {
    en: en, // English
    pt: pt, // Portuguese-BR (Brazil)
    zh: zh, // Chinese (Simplified)
    zh_TW: zh_TW, // Chinese (Traditional)
    hi: hi, // Hindi
    hu: hu, // Hungarian
    cs: cs, // Czech
    it: it, // Italian
    tr: tr, // Turkish
    bn: bn, // Bengali
    vi: vi, // Vietnamese
    ru: ru, // Russian
    uz: uz, // Uzbek
    es: es, // Spanish
    ja: ja, // Japanese
    ko: ko, // Korean
    idn: idn, // Indonesian
    mr: mr, // Marathi
    fr: fr, // French
    az: az, // Azerbaijani
    sl: sl, // Slovenian
    np: np, // Nepali
    ur: ur, // Urdu
    de: de, // German
    fa: fa, // Farsi (Persian)
    ar_SA: ar_SA, // Arabic (Saudi Arabia)
    el: el, // Greek
    ta: ta, // தமிழ்
    th: th, // Thai
    pl: pl, // Polish
    uk: uk, // Ukrainian
    sv: sv, // Swedish
};

// Map browser/system locale codes to this app's translation keys.
const langMap = {
    "ar": "ar_SA",
    "ar-SA": "ar_SA",
    "az": "az",
    "az-AZ": "az",
    "bn": "bn",
    "bn-BD": "bn",
    "bn-IN": "bn",
    "cs": "cs",
    "cs-CZ": "cs",
    "de": "de",
    "de-AT": "de",
    "de-CH": "de",
    "de-DE": "de",
    "el": "el",
    "el-GR": "el",
    "en": "en",
    "en-AU": "en",
    "en-CA": "en",
    "en-GB": "en",
    "en-IN": "en",
    "en-US": "en",
    "es": "es",
    "es-419": "es",
    "es-ES": "es",
    "es-MX": "es",
    "fa": "fa",
    "fa-IR": "fa",
    "fr": "fr",
    "fr-CA": "fr",
    "fr-FR": "fr",
    "hi": "hi",
    "hi-IN": "hi",
    "hu": "hu",
    "hu-HU": "hu",
    "id": "idn",
    "id-ID": "idn",
    "it": "it",
    "it-IT": "it",
    "ja": "ja",
    "ja-JP": "ja",
    "ko": "ko",
    "ko-KR": "ko",
    "mr": "mr",
    "mr-IN": "mr",
    "ne": "np",
    "ne-NP": "np",
    "pl": "pl",
    "pl-PL": "pl",
    "pt": "pt",
    "pt-BR": "pt",
    "pt-PT": "pt",
    "ru": "ru",
    "ru-RU": "ru",
    "sl": "sl",
    "sl-SI": "sl",
    "sv": "sv",
    "sv-SE": "sv",
    "ta": "ta",
    "ta-IN": "ta",
    "ta-LK": "ta",
    "th": "th",
    "th-TH": "th",
    "tr": "tr",
    "tr-TR": "tr",
    "uk": "uk",
    "uk-UA": "uk",
    "ur": "ur",
    "ur-IN": "ur",
    "ur-PK": "ur",
    "uz": "uz",
    "uz-Latn": "uz",
    "uz-Latn-UZ": "uz",
    "uz-UZ": "uz",
    "vi": "vi",
    "vi-VN": "vi",
    "zh": "zh",
    "zh-CN": "zh",
    "zh-Hans": "zh",
    "zh-Hans-CN": "zh",
    "zh-Hans-SG": "zh",
    "zh-SG": "zh",
    "zh-HK": "zh_TW",
    "zh-Hant": "zh_TW",
    "zh-Hant-HK": "zh_TW",
    "zh-Hant-MO": "zh_TW",
    "zh-Hant-TW": "zh_TW",
    "zh-MO": "zh_TW",
    "zh-TW": "zh_TW"
};

function getDetectedLanguage(translations) {
    const supported = Object.keys(translations);
    const raw = typeof navigator !== "undefined" ? navigator.language : "en";
    const mapped = langMap[raw] || raw;
    const normalized = mapped.replace("-", "_");
    const base = mapped.split(/[-_]/)[0];

    return supported.includes(mapped)
        ? mapped
        : supported.includes(normalized)
            ? normalized
            : supported.includes(base)
                ? base
                : "en";
}

// Define the width of the menu container for each language
const menuWidths = {
    en: "443px",
    ta: "522px",
    pt: "512px",
    sv: "472px",
    bn: "458px",
    uz: "497px",
    vi: "487px",
    cs: "494px",
    es: "488px",
    hi: "450px",
    mr: "460px",
    hu: "487px",
    ja: "486px",
    ru: "442px",
    it: "479px",
    idn: "477px",
    tr: "472px",
    fr: "517px",
    az: "460px",
    sl: "512px",
    np: "472px",
    de: "502px",
    fa: "502px",
    ar_SA: "482px",
    el: "497px",
    th: "497px",
    pl: "497px",
    uk: "497px",
    // Add more languages and widths as needed
};

const numberMappings = {
    "bn": { "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪", "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯" },
    "ta": { "0": "௦", "1": "௧", "2": "௨", "3": "௩", "4": "௪", "5": "௫", "6": "௬", "7": "௭", "8": "௮", "9": "௯" },
    "mr": { "0": "०", "1": "१", "2": "२", "3": "३", "4": "४", "5": "५", "6": "६", "7": "७", "8": "८", "9": "९" },
    "np": { "0": "०", "1": "१", "2": "२", "3": "३", "4": "४", "5": "५", "6": "६", "7": "७", "8": "८", "9": "९" },
    "fa": { 0: "۰", 1: "۱", 2: "۲", 3: "۳", 4: "۴", 5: "۵", 6: "۶", 7: "۷", 8: "۸", 9: "۹" },
    "ar_SA": { 0: "۰", 1: "۱", 2: "۲", 3: "۳", 4: "٤", 5: "٥", 6: "٦", 7: "۷", 8: "۸", 9: "۹" }
    // Add more languages as needed, Ensure it is supported in the fonts
};

const LRM = "\u200E"; // Left-to-Right Mark

function localizeNumbers(text, language) {
    const map = numberMappings[language]; // Get the numeral map for the current language

    // Define languages that use a comma as the decimal separator instead of a dot
    const specialDecimalLanguages = ["cs", "it", "pt", "ru", "tr", "vi", "uz", "es", "ko", "idn", "fr", "az", "sl", "hu", "de", "fa", "el", "uk", "sv"]; // Add more languages here as needed

    if (specialDecimalLanguages.includes(language)) {
        // Replace decimal point with a comma for specific languages
        text = text.replace(".", ",");
    }
    // Apply digit localization if the numeral map exists
    if (map) {
        text = text.replace(/\d/g, (digit) => map[digit] || digit);
    }

    // LRM marks, for RTL languages to ensure correct display
    const rtlFlipLanguages = ["ar_SA"];
    if (rtlFlipLanguages.includes(language)) {
        text = `${LRM}${text}${LRM}`;
    }

    return text; // Return the localized text
}

// Right-to-left languages
const rtlLanguages = ["ur", "fa", "ar_SA"];

// Function to apply the language to the page
function applyLanguage(lang) {
    document.title = translations[lang]?.newTabTitle || translations["en"].newTabTitle;

    // Mapping of text elements and their translation keys
    const translationMap = [
        "feedback",
        "resetsettings",
        "shortcutsText",
        "enableShortcutsText",
        "editShortcutsText",
        "shortcutsInfoText",
        "editShortcutsList",
        "editShortcutsListInfo",
        "adaptiveIconText",
        "adaptiveIconInfoText",
        "ai_tools_button",
        "enable_ai_tools",
        "aiToolsSettingsText",
        "aiToolsSettingsInfo",
        "googleAppsMenuText",
        "googleAppsMenuInfo",
        "todoListText",
        "todoListInfo",
        "fahrenheitCelsiusCheckbox",
        "fahrenheitCelsiusText",
        "minMaxTempText",
        "minMaxTempSubText",
        "hideWeatherTitle",
        "hideWeatherInfo",
        "hideWeatherBox",
        "hideWeatherBoxInfo",
        "micIconTitle",
        "micIconInfo",
        "hideSearchWith",
        "hideSearchWithInfo",
        "motivationalQuotesText",
        "motivationalQuotesInfo",
        "newQuoteOnRefreshText",
        "newQuoteOnRefreshInfo",
        "search_suggestions_button",
        "search_suggestions_text",
        "hideClockBox",
        "hideClockBoxInfo",
        "digitalclocktitle",
        "digitalclockinfo",
        "timeformattitle",
        "timeformatinfo",
        "greetingtitle",
        "greetinginfo",
        "userTextTitle",
        "userTextInfo",
        "useproxytitletext",
        "useproxyText",
        "ProxyText",
        "ProxySubtext",
        "HostproxyButton",
        "UserLocText",
        "UserLocSubtext",
        "useGPS",
        "useGPSInfo",
        "PrivacyPolicy",
        "WeatherApiText",
        "WeatherApiSubtext",
        "LearnMoreButton",
        "saveAPI",
        "enterBtn",
        "ai_tools",
        "defaultEngine",
        "googleEngine",
        "duckEngine",
        "bingEngine",
        "braveEngine",
        "youtubeEngine",
        "gImagesEngine",
        "redditEngine",
        "wikipediaEngine",
        "quoraEngine",
        "chatGPT",
        "gemini",
        "copilot",
        "claude",
        "grok",
        "qwen",
        "perplexity",
        "deepseek",
        "metaAI",
        'firefly',
        "github",
        "googleAppsHover",
        "todoListHover",
        "uploadWallpaperText",
        "backupText",
        "restoreText",
        "rangColor",
        "bookmarksText",
        "bookmarksInfo",
        "bookmarksHeading",
        "bookmarkSortBy",
        "sortAlphabetical",
        "sortTimeAdded",
        "bookmarkViewAs",
        "bookmarkViewGrid",
        "bookmarkViewList",
        "editBookmarkHeading",
        "lightThemed",
        "darkThemed",
        "systemThemed",
        "switchSearchModes",
        "switchSearchModesInfo",
        "adjustZoom",
        "changeBrowserTheme",
        "updateFirefoxHomepage",
        "dontShowTips",
        "aiSettingsIntro",
        "resetAISettingsBtn",
        "opacityTitle",
        "adjustOpacityDesc",
        "footerToastTitle",
        "footerToastMessage",
        "personalizationSectionTitle",
        "clockSectionTitle",
        "searchSectionTitle",
        "weatherSectionTitle",
        "appearanceSectionTitle",
        "settingsSectionTitle",
        "iconFileTooLargeMessage",
        "iconStorageQuotaMessage"
    ];

    // Specific mapping for placeholders
    const placeholderMap = [
        { id: "userLoc", key: "userLoc" },
        { id: "userAPI", key: "userAPI" },
        { id: "searchQ", key: "searchPlaceholder" },
        { id: "todoInput", key: "todoPlaceholder" },
        { id: "bookmarkSearch", key: "bookmarkSearch" },
        { id: "editBookmarkName", key: "editBookmarkName" },
        { id: "editBookmarkURL", key: "editBookmarkURL" }
    ];

    // Mapping of elements and their different translation keys
    const elementsMap = [
        { id: "todoListHeading", key: "todoListText" },
        { id: "defaultEngineDD", key: "defaultEngine" },
        { id: "googleEngineDD", key: "googleEngine" },
        { id: "duckEngineDD", key: "duckEngine" },
        { id: "bingEngineDD", key: "bingEngine" },
        { id: "braveEngineDD", key: "braveEngine" },
        { id: "youtubeEngineDD", key: "youtubeEngine" },
        { id: "gImagesEngineDD", key: "gImagesEngine" },
        { id: "redditEngineDD", key: "redditEngine" },
        { id: "wikipediaEngineDD", key: "wikipediaEngine" },
        { id: "quoraEngineDD", key: "quoraEngine" },
        { id: "bookmarksHover", key: "bookmarksHeading" },
        { id: "saveproxy", key: "saveAPI" },
        { id: "saveLoc", key: "saveAPI" },
        { id: "saveBookmarkChanges", key: "saveAPI" },
        { id: "cancelBookmarkEdit", key: "cancelText" },
        { id: "aiSettingsHeader", key: "aiToolsSettingsText" },
        { id: "saveAISettingsBtn", key: "saveAPI" },
        { id: "editBookmarkNameLabel", key: "editBookmarkName" },
        { id: "editBookmarkURLLabel", key: "editBookmarkURL" },
        { id: "shortcutsSectionTitle", key: "shortcutsText" },
    ];

    // Function to apply translations
    function applyTranslations(items, isPlaceholder) {
        items.forEach(item => {
            // Get the element by its ID
            const element = document.getElementById(item.id || item);
            if (element) {
                // Use "key" if defined, otherwise use "id" as the translation key
                const key = item.key || item;
                // Get the translation, fallback to English if not found in the current language
                const translation = translations[lang]?.[key] || translations["en"]?.[key];

                // Apply the translation to either placeholder or innerText
                if (isPlaceholder) {
                    element.placeholder = translation;
                } else {
                    element.innerText = translation;
                }
            }
        });
    }

    // Apply the translations
    applyTranslations(placeholderMap, true);   // For placeholders
    applyTranslations(elementsMap, false);     // For innerTexts with different IDs and keys
    applyTranslations(translationMap, false);  // For innerTexts with same ID and keys

    // For userText
    const userTextDiv = document.getElementById("userText");
    if (translations[lang]) {
        const placeholder = translations[lang]?.userText || translations["en"].userText;
        userTextDiv.dataset.placeholder = placeholder; // Update the placeholder in data attribute
        // Only set the text content if there's nothing in localStorage
        if (!localStorage.getItem("userText")) {
            userTextDiv.innerText = placeholder;
        }
    }

    // Update placeholders on already-rendered shortcut inputs
    document.querySelectorAll(".shortcutSettingsEntry .shortcutName")
        .forEach(el => el.placeholder = translations[lang]?.shortcutInputName  || translations["en"].shortcutInputName);
    document.querySelectorAll(".shortcutSettingsEntry .URL")
        .forEach(el => el.placeholder = translations[lang]?.shortcutInputUrl   || translations["en"].shortcutInputUrl);
    document.querySelectorAll(".shortcutSettingsEntry .iconURL")
        .forEach(el => el.placeholder = translations[lang]?.shortcutInputIcon  || translations["en"].shortcutInputIcon);

    // Update hover text for #menuCloseButton
    const menuCloseButton = document.getElementById("menuCloseButton");
    if (menuCloseButton) {
        const hoverText = translations[lang]?.menuCloseText || translations["en"].menuCloseText;
        menuCloseButton.setAttribute("data-lang", hoverText);
    }

    // Update the width of the menu container based on the language
    const menuCont = document.querySelector(".menuBar .menuCont");
    if (menuCont) {
        menuCont.style.width = menuWidths[lang] || menuWidths["en"];
        let widthh = window.innerWidth / parseInt(menuWidths[lang] || menuWidths["en"]);
        if (window.innerWidth < 522) {
            let menuStyle = document.getElementById("menuStyle") || document.createElement("style");
            menuStyle.id = "menuStyle";
            menuStyle.innerHTML = `
                .menuCont {
                    scale: ${widthh} !important;
                    height: ${(100 / widthh).toString()}dvh !important;
                    transform-origin: top right !important;
                }
            `;
            document.head.append(menuStyle);
        }
    }

    // Function to dynamically load Google Fonts
    function loadFont(fontUrl) {
        if (!document.querySelector(`link[href="${fontUrl}"]`)) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = fontUrl;
            document.head.appendChild(link);
        }
    }

    // Dynamically update the font family based on the language
    const root = document.documentElement;
    const commonFontStack = "'poppins', 'Poppins', sans-serif";
    if (lang === "vi") {
        loadFont("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro&display=swap");
        root.style.setProperty("--main-font-family", `"Be Vietnam Pro", ${commonFontStack}`);
    } else if (lang === "ur") {
        loadFont("https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic&display=swap");
        root.style.setProperty("--main-font-family", `"Noto Sans Arabic", ${commonFontStack}`);
    } else if (lang === "fa") {
        loadFont("https://fonts.googleapis.com/css2?family=Vazirmatn&display=swap"); // Using Vazirmatn for Farsi
        root.style.setProperty("--main-font-family", `"Vazirmatn", ${commonFontStack}`);
    } else {
        root.style.setProperty("--main-font-family", commonFontStack);
    }

    // Apply the direction attribute to specific selectors for RTL languages
    const isRTL = rtlLanguages.includes(lang);
    const rtlSelectors = [".topDiv", ".searchbar", ".searchWithCont", ".resultBox", ".quotesCont",
        ".leftDiv", ".shortcutsContainer", ".page", "#prompt-modal-box", ".todo-container",
        ".bookmark-search-container", ".bookmark-controls-container", "#editBookmarkModal", ".liquidGlass-toast"];

    rtlSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.setAttribute("dir", isRTL ? "rtl" : "ltr");
        });
    });

    // Update feelsLike element styles for RTL languages
    const feelsLikeElement = document.getElementById("feelsLike");
    feelsLikeElement.style.left = isRTL ? "12px" : "";
    feelsLikeElement.style.paddingRight = isRTL ? "43px" : "";
    feelsLikeElement.style.width = isRTL ? "calc(100% - 12px)" : "";
    feelsLikeElement.style.textAlign = isRTL ? "right" : "left";

    const quotesText = document.querySelector(".quotesContainer");
    // quotesText.style.textAlign = isRTL ? "right" : "left";
    quotesText.style.fontFamily = commonFontStack;

    // Save the selected language in localStorage
    document.documentElement.lang = lang;
    saveLanguageStatus("selectedLanguage", lang);
}

{
    // Keep selectedLanguage as the effective language for existing scripts.
    const savedLanguageMode = getLanguageStatus("selectedLanguageMode");
    const savedLanguage = getLanguageStatus("selectedLanguage");

    if (!savedLanguage || savedLanguage === "system" || savedLanguageMode === "system") {
        saveLanguageStatus("selectedLanguageMode", "system");
        saveLanguageStatus("selectedLanguage", getDetectedLanguage(translations));
    } else if (!translations[savedLanguage]) {
        saveLanguageStatus("selectedLanguageMode", "manual");
        saveLanguageStatus("selectedLanguage", "en");
    }
}

document.getElementById("languageSelector").addEventListener("change", (event) => {
    const value = event.target.value;

    if (value === "system") {
        // Store the selector mode separately so "system" never reaches translators.
        saveLanguageStatus("selectedLanguageMode", "system");
        applyLanguage(getDetectedLanguage(translations));
    } else {
        saveLanguageStatus("selectedLanguageMode", "manual");
        applyLanguage(value);
    }

    location.reload();
});

// Function to apply the language when the page loads
window.onload = function () {
    const saved = getLanguageStatus("selectedLanguage");
    const mode = getLanguageStatus("selectedLanguageMode");
    const useSystemLanguage = !saved || saved === "system" || mode === "system";
    const lang = useSystemLanguage
        ? getDetectedLanguage(translations)
        : translations[saved]
            ? saved
            : "en";

    document.getElementById("languageSelector").value = useSystemLanguage ? "system" : lang;
    applyLanguage(lang);

    if (useSystemLanguage) {
        saveLanguageStatus("selectedLanguageMode", "system");
        saveLanguageStatus("selectedLanguage", lang);
    }
};

// Function to save the language status in localStorage
function saveLanguageStatus(key, languageStatus) {
    localStorage.setItem(key, languageStatus);
}

// Function to get the language status from localStorage
function getLanguageStatus(key) {
    return localStorage.getItem(key);
}
