// English (Default)
const en = {
    // Title
    "newTabTitle": "New Tab",

    // Body - Weather
    "conditionText": "Hello! How are you today?",
    "humidityLevel": "Humidity",
    "feelsLike": "Feels",
    "minMaxTemp": "Min ~ Max",
    "location": "Earth",

    // Body - Search
    "enterBtn": "Search",
    "searchPlaceholder": "Type here...",
    "listenPlaceholder": "Listening...",
    "searchWithHint": "Search With",
    "searchOnHint": "Search On",

    // Search Engines
    "defaultEngine": "Default",
    "googleEngine": "Google",
    "duckEngine": "Duck",    // DuckDuckGo
    "bingEngine": "Bing",
    "braveEngine": "Brave",
    "youtubeEngine": "YouTube",
    "gImagesEngine": "Images",  // Google Images, https://www.google.com/search?q=check&hl=bn
    "redditEngine": "Reddit",
    "wikipediaEngine": "Wikipedia",
    "quoraEngine": "Quora",

    // Body - Left Section
    // Greeting
    greeting: {
        "morning": "Good Morning!",
        "afternoon": "Good Afternoon!",
        "evening": "Good Evening!"
    },

    // Calendar
    "days": ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    "months": ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

    // Footer Toast
    "footerToastTitle": "Seeing a banner at the bottom?",
    "footerToastMessage": "To hide it, right-click it and select 'Hide Footer on New Tab Page'.",

    // Prompts and Alerts
    "okText": "OK",
    "yesText": "Yes",
    "noText": "No",
    "agreeText": "I Agree",
    "cancelText": "Cancel",
    "saveAPI": "Save",

    // Menu Items
    "github": "GitHub",
    "feedback": "Feedback",

    // Shortcuts
    "shortcutsText": "Shortcuts",
    "enableShortcutsText": "Show saved shortcuts",
    "editShortcutsText": "Edit Shortcuts",
    "shortcutsInfoText": "Choose which shortcuts get shown",
    "editShortcutsList": "Saved Shortcuts",
    "editShortcutsListInfo": "You can add new shortcuts by clicking the \"+\" icon or edit existing ones by clicking on the shortcut name or URL.\nTo reset a custom icon, simply clear the image URL.",
    "adaptiveIconText": "Adaptive Icons",
    "adaptiveIconInfoText": "Shortcut icons will adapt to theme",

    // Shortcuts Placeholder
    "shortcutDefaultName": "New Shortcut",
    "shortcutInputName": "Shortcut Name",
    "shortcutInputUrl": "Shortcut URL",
    "shortcutInputIcon": "Custom Icon: URL or SVG (optional)",

    // Shortcuts Tooltips
    "addShortcut": "Add shortcut",
    "resetShortcuts": "Reset shortcuts",
    "deleteShortcut": "Delete shortcut",
    "uploadIcon": "Upload icon",

    // Shortcuts Alerts
    "resetShortcutsPrompt": "All saved shortcuts will be deleted and reset to default. Do you want to continue?",
    "invalidFileTypeMessage": "Please select a valid image file.",
    "invalidSvgMessage": "Inserted SVG is invalid, or it contains unsafe content and cannot be used as an icon.",
    "invalidIconUrlMessage": "Please enter a valid image URL (must start with https://, http://, or data:image/).",
    "iconFileTooLargeMessage": "Selected file is too large: {size} KB. Please use a file smaller than {max} KB.",
    "iconStorageQuotaMessage": "Icon couldn’t be saved because the storage limit has been reached. Remove some custom icons or use a smaller image.",

    // Personalization
    "personalizationSectionTitle": "Personalization",

    // Bookmarks
    "bookmarksText": "Bookmarks",
    "bookmarksInfo": "Show bookmarks sidebar",
    "UnsupportedBrowser": "Bookmarks are not supported in your browser.",

    // Bookmarks - Sidebar
    "bookmarksHeading": "Bookmarks",
    "bookmarkSearch": "Search bookmark",
    "favoriteBookmarks": "Favorites",
    "recentlyAddedBookmarks": "Recently Added",
    "foldersSection": "Folders",

    // Bookmarks - Options menu
    "bookmarkDisplay": "Display",
    "bookmarkSortBy": "Sort by",
    "sortDefault": "Browser order",
    "sortAlphabetical": "A-Z",
    "sortAlphabeticalDesc": "Z-A",
    "sortTimeAdded": "Old-New",
    "sortTimeAddedDesc": "New-Old",
    "bookmarkViewAs": "View as",
    "bookmarkViewGrid": "Grid",
    "bookmarkViewList": "List",
    "addBookmark": "Add bookmark",
    "showRecent": "Show recent",
    "recentCount": "Recent count",
    "showFavorites": "Show favorites",

    // Bookmarks - Item and section menus
    "hideFavorites": "Hide favorites",
    "hideRecent": "Hide recent",
    "addToFavorite": "Add to favorite",
    "removeFromFavorite": "Remove from favorite",
    "moveFavoriteUp": "Move up",
    "moveFavoriteDown": "Move down",
    "addToShortcuts": "Add to shortcuts",
    "shortcutLimitReached": "Couldn't add to shortcuts. You've reached the limit of {max} shortcuts.",
    "editBookmarkLabel": "Edit bookmark",
    "deleteBookmarkLabel": "Delete bookmark",
    "deleteBookmarkFolderLabel": "Delete folder and bookmarks",

    // Bookmarks - Modal
    "editBookmarkHeading": "Edit Bookmark",
    "editBookmarkName": "Bookmark Name",
    "editBookmarkURL": "Bookmark URL",
    "deleteBookmark": "Are you sure you want to delete the bookmark \"{title}\"?",  // Do not translate {title}

    // Bookmarks - Folder picker
    "addBookmarkHeading": "Add Bookmark",
    "bookmarkFolder": "Folder",
    "newFolderName": "New folder name",
    "newFolderIn": "Will be created in",
    "untitledFolder": "Untitled folder",
    "deleteBookmarkFolder": "Are you sure you want to delete the folder \"{title}\" and the {count} bookmark(s) inside it? This cannot be undone.",
    "invalidBookmarkUrl": "Please enter a valid URL",
    "newFolderButton": "New folder",
    "createFolderButton": "Create folder",

    // AI Tools
    "ai_tools_button": "AI Tools",
    "enable_ai_tools": "Show shortcuts for AI tools",
    "aiToolsSettingsText": "AI Tools Settings",
    "aiToolsSettingsInfo": "Manage AI tools shortcuts",

    // AI Tools - Pills
    "chatGPT": "ChatGPT",
    "gemini": "Gemini",
    "copilot": "Copilot",
    "claude": "Claude",
    "grok": "Grok",
    "perplexity": "Perplexity",
    "deepseek": "DeepSeek",
    "metaAI": "Meta AI",

    // AI Tools - Modal
    "ai_tools": "AI Tools", // Tooltip in the new tab
    "aiSettingsIntro": "Select which AI tools to display",
    "aiToolAddButton": "Add tool",
    "aiToolAddTitle": "Add a custom AI tool",
    "aiToolEditTitle": "Edit custom AI tool",
    "aiToolAddConfirm": "Add",
    "aiToolName": "Name",
    "aiToolUrl": "URL",
    "aiToolIcon": "Icon URL or SVG (optional)",
    "aiToolEditLabel": "Edit {name}",    // Do not translate {name}
    "aiToolDeleteLabel": "Delete {name}",    // Do not translate {name}
    "resetAISettingsBtn": "Reset",

    // To-do List
    "todoListHover": "ToDo List",    // Keep this short
    "todoPlaceholder": "Add task...",
    "todoListText": "To Do List",
    "todoListInfo": "Show a daily To Do list",

    // Google Apps
    "googleAppsHover": "Google Apps",    // Keep this shorter
    "googleAppsMenuText": "Google Apps",
    "googleAppsMenuInfo": "Show shortcuts for Google Apps",

    // Clock
    "clockSectionTitle": "Clock",
    "hideClockBox": "Hide Clock",

    // Digital Clock
    "hideClockBoxInfo": "Hide the clock and date",
    "digitalclocktitle": "Digital Clock",
    "digitalclockinfo": "Switch to the digital clock",
    "timeformattitle": "12-Hour Format",
    "timeformatinfo": "Use 12-hour time format",
    "greetingtitle": "Greeting",
    "greetinginfo": "Show greeting below custom text",

    // User Text
    "userText": "Click here to edit",
    "userTextTitle": "Customizable Text",
    "userTextInfo": "Show custom text below the clock",

    // Search
    "searchSectionTitle": "Search",
    "micIconTitle": "Hide Microphone Button",
    "micIconInfo": "If voice typing is not working",
    "aiModeIconTitle": "Hide AI Mode Button",
    "aiModeIconInfo": "Hide Google AI Mode search button",
    "hideSearchWith": "Hide Search Engines",
    "hideSearchWithInfo": "Switch between search engines by clicking its icon",

    // Quotes
    "motivationalQuotesText": "Motivational Quotes",
    "motivationalQuotesInfo": "Show quotes below the searchbar",
    "newQuoteOnRefreshText": "Daily Quote",
    "newQuoteOnRefreshInfo": "Show one quote per day instead of refreshing each time",

    // Search Suggestions
    "search_suggestions_button": "Search Suggestions",
    "search_suggestions_text": "Enable search suggestions",

    // Proxy
    "useproxytitletext": "Proxy Bypass",
    "useproxyText": "If search suggestions aren't working",
    "ProxyText": "CORS Bypass Proxy",
    "ProxySubtext": "Add your own CORS bypass proxy",
    "HostproxyButton": "Host your own proxy",
    "ProxyDisclaimer": "All proxy features are off by default.\n\nIf you enable search suggestions and CORS bypass proxy, it is strongly recommended to host your own proxy for enhanced privacy.\n\nBy default, the proxy will be set to https://mynt-proxy.rhythmcorehq.com, meaning all your data will go through this service, which may pose privacy concerns.",

    // Weather
    "weatherSectionTitle": "Weather",
    "hideWeatherTitle": "Hide Weather",
    "hideWeatherInfo": "Disable the weather widgets",
    "hideWeatherBox": "Hide Weather Card",    // Toggle for mobile devices only
    "hideWeatherBoxInfo": "Show only temperature pill",
    "minMaxTempText": "Min-Max Temperature",
    "minMaxTempSubText": "Replace 'Feels Like' with minimum and maximum temperature",

    // Fahrenheit
    "fahrenheitCelsiusCheckbox": "Switch to Fahrenheit",
    "fahrenheitCelsiusText": "Refresh the page to apply changes",

    // Location
    "UserLocText": "Enter your Location",
    "UserLocSubtext": "If the weather location isn't correct",
    "userLoc": "Your City or Coordinates (Latitude, Longitude)",
    "PrivacyPolicy": "Privacy policy",

    // GPS
    "useGPS": "Use GPS",
    "useGPSInfo": "Enable GPS for live location updates",
    "GPSDisclaimer": "Your location data is used solely to provide accurate weather updates. It is temporarily stored within the browser and neither shared with any third-party services nor accessible to us.\n\nBy enabling GPS, you consent to sharing your location with the extension locally.",


    // WeatherAPI
    "WeatherApiText": "Enter your WeatherAPI key",    // For 'WeatherAPI' string, only transliterate
    "WeatherApiSubtext": "If the weather functionality isn't working",
    "userAPI": "Your weatherAPI key",
    "LearnMoreButton": "Learn more",

    // Appearance
    "appearanceSectionTitle": "Appearance",

    // Theme
    "lightThemed": "Light",
    "darkThemed": "Dark",
    "systemThemed": "System",
    "rangColor": "Pick color",    // Keep this short

    // Wallpaper
    "uploadWallpaperText": "Upload Wallpaper",    // Keep this short
    "opacityTitle": "Opacity",
    "adjustOpacityDesc": "Adjust interface transparency",

    // Wallpaper Alerts
    "confirmWallpaper": "Would you like to set a new image as your wallpaper for the day?",
    "Nobackgroundset": "No background image is currently set.",
    "clearbackgroundimage": "Are you sure you want to clear the background image?",

    // Settings
    "settingsSectionTitle": "Settings",
    "backupText": "Backup",
    "restoreText": "Restore",
    "resetsettings": "Reset Settings",
    "menuCloseText": "Close",

    // Backup and Restore Alerts
    "failedbackup": "Backup failed: ",
    "restorecompleted": "Restore completed successfully!",
    "restorefailed": "Restore failed: ",
    "invalidBackup": "Invalid backup file selected.",
    "confirmRestore": "Are you sure you want to reset your settings? This action cannot be undone.",


    // Tips
    "switchSearchModes": "Switch Search Modes",
    "switchSearchModesInfo": "Click on ‘Search With’ to change the mode.",
    "adjustZoom": "Adjust Zoom",
    "adjustZoomInfo": "Press Ctrl + \"+\" or Ctrl + \"-\" to adjust the zoom.",

    // Tips - Theme
    "changeBrowserTheme": "Change Browser Theme",
    "chromeThemeInfo": "Click the three dots (⋮) > More tools > Customize Chrome, then choose a color that matches the extension theme.",
    "edgeThemeInfo": "Go to Settings > Appearance, then choose a color that matches the extension theme.",
    "braveThemeInfo": "Visit <a href=\"https://chromewebstore.google.com/category/themes/\" target=\"_blank\">Chrome Theme Store</a>, download and apply the theme that matches the extension.",
    "firefoxThemeInfo": "Visit <a href=\"https://addons.mozilla.org/firefox/themes/\" target=\"_blank\">Firefox Themes</a>, download and apply the theme that matches the extension.",

    // Tips - Firefox
    "updateFirefoxHomepage": "Update Homepage",
    "updateFirefoxHomepageInfo": "To change your homepage like the new tab as well, visit <a href=\"https://github.com/prem-k-r/MaterialYouNewTab#-firefox\" target=\"_blank\">this link</a> and follow the instructions.",
    "dontShowTips": "Don't show it again"
};
