// Bengali
const bn = {
    // Title
    "newTabTitle": "নতুন ট্যাব",

    // Body - Weather
    "conditionText": "হ্যালো! আজ আপনি কেমন আছেন?",
    "humidityLevel": "আর্দ্রতা",
    "feelsLike": "অনুভূতি হয়",
    "minMaxTemp": "নিম্ন ~ উচ্চ",
    "location": "পৃথিবী",

    // Body - Search
    "enterBtn": "সার্চ করুন",
    "searchPlaceholder": "এখানে টাইপ করুন...",
    "listenPlaceholder": "শোনা হচ্ছে...",
    "searchWithHint": "দিয়ে সার্চ করুন",
    "searchOnHint": "এ সার্চ করুন",

    // Search Engines
    "defaultEngine": "ডিফল্ট",
    "googleEngine": "গুগল",
    "duckEngine": "ডাকডাকগো",
    "bingEngine": "বিং",
    "braveEngine": "ব্রেভ",
    "youtubeEngine": "ইউটিউব",
    "gImagesEngine": "ছবি",
    "redditEngine": "রেডিট",
    "wikipediaEngine": "উইকিপিডিয়া",
    "quoraEngine": "কোরা",

    // Body - Left Section
    // Greeting
    greeting: {
        "morning": "শুভ সকাল!",
        "afternoon": "শুভ বিকেল!",
        "evening": "শুভ সন্ধ্যা!"
    },

    // Calendar
    "days": ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি'],    // Truncated for display
    //"days": ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'],   // Full
    "months": ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'],
    // "months": ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রি', 'মে', 'জুন', 'জুলাই', 'আগ', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'],   // Truncated

    // Footer Toast
    "footerToastTitle": "নীচে কোনো ব্যানার দেখাচ্ছে?",
    "footerToastMessage": "এটি লুকাতে, এর উপর রাইট-ক্লিক করুন এবং 'নিউ ট্যাব পেজে ফুটার লুকান' নির্বাচন করুন।",

    // Prompts and Alerts
    "okText": "ঠিক আছে",
    "yesText": "হ্যাঁ",
    "noText": "না",
    "agreeText": "আমি রাজি",
    "cancelText": "বাতিল করুন",
    "saveAPI": "সংরক্ষণ করুন",

    // Menu Items
    "github": "গিটহাব",
    "feedback": "মতামত",

    // Shortcuts
    "shortcutsText": "শর্টকাট",
    "enableShortcutsText": "সংরক্ষিত শর্টকাটগুলি প্রদর্শন করুন",
    "editShortcutsText": "শর্টকাট সম্পাদনা করুন",
    "shortcutsInfoText": "যে শর্টকাটগুলো দেখাতে চান তা নির্বাচন করুন",
    "editShortcutsList": "সংরক্ষিত শর্টকাট",
    "editShortcutsListInfo": "\"+\" আইকনে ক্লিক করে নতুন শর্টকাট যোগ করুন অথবা বিদ্যমান শর্টকাটের নাম বা URL-এ ক্লিক করে সম্পাদনা করুন। কাস্টম আইকন রিসেট করতে ইমেজ URL খালি করুন।",
    "adaptiveIconText": "অ্যাডাপ্টিভ আইকন",
    "adaptiveIconInfoText": "শর্টকাট আইকন থিম রঙের সাথে মিলে ছোট আকারে প্রদর্শিত হবে",

    // Shortcuts Placeholder
    "shortcutDefaultName": "নতুন শর্টকাট",
    "shortcutInputName": "শর্টকাটের নাম",
    "shortcutInputUrl": "শর্টকাটের URL",
    "shortcutInputIcon": "কাস্টম আইকন: URL অথবা SVG (ঐচ্ছিক)",

    // Shortcuts Tooltips
    "addShortcut": "শর্টকাট যোগ করুন",
    "resetShortcuts": "শর্টকাট রিসেট করুন",
    "deleteShortcut": "শর্টকাট মুছুন",
    "uploadIcon": "আইকন আপলোড করুন",

    // Shortcuts Alerts
    "resetShortcutsPrompt": "সব সংরক্ষিত শর্টকাট মুছে ফেলা হবে এবং ডিফল্ট অবস্থায় পুনরায় সেট করা হবে। আপনি কি চালিয়ে যেতে চান?",
    "invalidFileTypeMessage": "একটি বৈধ ইমেজ ফাইল নির্বাচন করুন।",
    "invalidSvgMessage": "অবৈধ SVG অথবা এতে অনিরাপদ বিষয়বস্তু রয়েছে এবং এটি আইকন হিসাবে ব্যবহার করা যাবে না।",
    "invalidIconUrlMessage": "একটি বৈধ ইমেজ URL লিখুন (https://, http://, অথবা data:image/ দিয়ে শুরু হতে হবে)।",
    "iconFileTooLargeMessage": "নির্বাচিত ফাইলটি খুব বড়: {size} KB। অনুগ্রহ করে {max} KB এর কম আকারের ফাইল ব্যবহার করুন।",
    "iconStorageQuotaMessage": "স্টোরেজ সীমা পূর্ণ হয়ে যাওয়ায় আইকন সংরক্ষণ করা যায়নি। অনুগ্রহ করে ছোট আকারের ছবি ব্যবহার করুন।",

    // Personalization
    "personalizationSectionTitle": "ব্যক্তিগতকরণ",

    // Bookmarks
    "bookmarksText": "বুকমার্কস",
    "bookmarksInfo": "বুকমার্কস সাইডবার দেখুন",
    "UnsupportedBrowser": "আপনার ব্রাউজারে বুকমার্ক সমর্থিত নয়।",

    // Bookmarks - Sidebar
    "bookmarksHeading": "বুকমার্কস",
    "bookmarkSearch": "বুকমার্ক সার্চ করুন",
    "favoriteBookmarks": "পছন্দের",
    "recentlyAddedBookmarks": "সম্প্রতি যোগ করা",
    "foldersSection": "ফোল্ডারসমূহ",

    // Bookmarks - Options menu
    "bookmarkDisplay": "প্রদর্শন",
    "bookmarkSortBy": "অনুসারে সাজান",
    "sortDefault": "ব্রাউজারের ক্রম",
    "sortAlphabetical": "A-Z",
    "sortAlphabeticalDesc": "Z-A",
    "sortTimeAdded": "পুরাতন-নতুন",
    "sortTimeAddedDesc": "নতুন-পুরাতন",
    "bookmarkViewAs": "এইভাবে দেখুন",
    "bookmarkViewGrid": "গ্রিড",
    "bookmarkViewList": "লিস্ট",
    "addBookmark": "বুকমার্ক যোগ করুন",
    "showRecent": "সাম্প্রতিক দেখান",
    "recentCount": "সাম্প্রতিকের সংখ্যা",
    "showFavorites": "পছন্দের দেখান",

    // Bookmarks - Item and section menus
    "hideFavorites": "পছন্দের লুকান",
    "hideRecent": "সাম্প্রতিক লুকান",
    "addToFavorite": "পছন্দের তালিকায় যোগ করুন",
    "removeFromFavorite": "পছন্দের তালিকা থেকে সরান",
    "moveFavoriteUp": "উপরে সরান",
    "moveFavoriteDown": "নিচে সরান",
    "addToShortcuts": "শর্টকাটে যোগ করুন",
    "shortcutLimitReached": "শর্টকাটে যোগ করা যায়নি। আপনি সর্বোচ্চ {max}টি শর্টকাটের সীমায় পৌঁছে গেছেন।",
    "editBookmarkLabel": "বুকমার্ক সম্পাদনা করুন",
    "deleteBookmarkLabel": "বুকমার্ক মুছুন",
    "deleteBookmarkFolderLabel": "ফোল্ডার ও বুকমার্ক মুছুন",

    // Bookmarks - Modal
    "editBookmarkHeading": "বুকমার্ক সম্পাদনা করুন",
    "editBookmarkName": "বুকমার্কের নাম",
    "editBookmarkURL": "বুকমার্কের URL",
    "deleteBookmark": "আপনি কি নিশ্চিত যে আপনি \"{title}\" বুকমার্কটি মুছে ফেলতে চান?",

    // Bookmarks - Folder picker
    "addBookmarkHeading": "বুকমার্ক যোগ করুন",
    "bookmarkFolder": "ফোল্ডার",
    "newFolderName": "নতুন ফোল্ডারের নাম",
    "newFolderIn": "যেখানে তৈরি হবে",
    "untitledFolder": "শিরোনামহীন ফোল্ডার",
    "deleteBookmarkFolder": "আপনি কি নিশ্চিত যে আপনি \"{title}\" ফোল্ডার এবং এর ভেতরের {count}টি বুকমার্ক মুছে ফেলতে চান? এটি পূর্বাবস্থায় ফেরানো যাবে না।",
    "invalidBookmarkUrl": "একটি বৈধ URL লিখুন",
    "newFolderButton": "নতুন ফোল্ডার",
    "createFolderButton": "ফোল্ডার তৈরি করুন",

    // AI Tools
    "ai_tools_button": "এআই সরঞ্জাম",
    "enable_ai_tools": "এআই সরঞ্জামের শর্টকাট প্রদর্শন করুন",
    "aiToolsSettingsText": "এআই সরঞ্জাম সেটিংস",
    "aiToolsSettingsInfo": "এআই সরঞ্জামের শর্টকাট পরিচালনা করুন",

    // AI Tools - Pills
    "chatGPT": "চ্যাটজিপিটি",
    "gemini": "জেমিনি",
    "copilot": "কোপাইলট",
    "claude": "ক্লড",
    "grok": "গ্রোক",
    "perplexity": "পারপ্লেক্সিটি",
    "deepseek": "ডিপসিক",
    "metaAI": "মেটা এআই",

    // AI Tools - Modal
    "ai_tools": "এআই টুলস",
    "aiSettingsIntro": "যে এআই টুলগুলো দেখাতে চান তা নির্বাচন করুন",
    "aiToolAddButton": "টুল যোগ করুন",
    "aiToolAddTitle": "কাস্টম এআই টুল যোগ করুন",
    "aiToolEditTitle": "কাস্টম এআই টুল সম্পাদনা করুন",
    "aiToolAddConfirm": "যোগ করুন",
    "aiToolName": "নাম",
    "aiToolUrl": "URL",
    "aiToolIcon": "আইকন URL অথবা SVG (ঐচ্ছিক)",
    "aiToolEditLabel": "{name} সম্পাদনা করুন",
    "aiToolDeleteLabel": "{name} মুছুন",
    "resetAISettingsBtn": "রিসেট করুন",

    // To-do List
    "todoListHover": "টু ডু লিস্ট",
    "todoPlaceholder": "টাস্ক যোগ করুন...",
    "todoListText": "টু ডু লিস্ট",
    "todoListInfo": "দৈনিক কাজের তালিকা দেখুন",

    // Google Apps
    "googleAppsHover": "গুগল অ্যাপস",
    "googleAppsMenuText": "গুগল অ্যাপস",
    "googleAppsMenuInfo": "গুগল অ্যাপসের শর্টকাট প্রদর্শন করুন",

    // Clock
    "clockSectionTitle": "ঘড়ি",
    "hideClockBox": "ঘড়ি লুকান",

    // Digital Clock
    "hideClockBoxInfo": "ঘড়ি এবং তারিখ লুকান",
    "digitalclocktitle": "ডিজিটাল ঘড়ি",
    "digitalclockinfo": "ডিজিটাল ঘড়িতে পরিবর্তন করুন",
    "timeformattitle": "১২-ঘণ্টা ফরম্যাট",
    "timeformatinfo": "১২-ঘণ্টার সময় ফরম্যাট ব্যবহার করুন",
    "greetingtitle": "অভিবাদন",
    "greetinginfo": "কাস্টম টেক্সটের নিচে অভিবাদন দেখান",

    // User Text
    "userText": "এডিট করতে এখানে ক্লিক করুন",
    "userTextTitle": "কাস্টমাইজেবল টেক্সট",
    "userTextInfo": "ঘড়ির নিচে কাস্টম টেক্সট দেখান",

    // Search
    "searchSectionTitle": "অনুসন্ধান",
    "micIconTitle": "মাইক্রোফোন বোতাম লুকান",
    "micIconInfo": "যদি ভয়েস টাইপিং কাজ না করে",
    "aiModeIconTitle": "AI মোড বোতাম লুকান",
    "aiModeIconInfo": "Google AI মোড সার্চ বোতাম লুকান",
    "hideSearchWith": "সার্চ ইঞ্জিন লুকান",
    "hideSearchWithInfo": "সার্চ ইঞ্জিনের আইকনে ক্লিক করে সার্চ ইঞ্জিন পরিবর্তন করুন",

    // Quotes
    "motivationalQuotesText": "অনুপ্রেরণামূলক উক্তি",
    "motivationalQuotesInfo": "সার্চবারের নিচে উক্তি দেখান",
    "newQuoteOnRefreshText": "দৈনিক উক্তি",
    "newQuoteOnRefreshInfo": "প্রতিবার রিফ্রেশ হওয়ার পরিবর্তে দিনে একটি উক্তি দেখান",

    // Search Suggestions
    "search_suggestions_button": "সার্চ সাজেশন",
    "search_suggestions_text": "সার্চ সাজেশন সক্রিয় করুন",

    // Proxy
    "useproxytitletext": "প্রক্সি বাইপাস",
    "useproxyText": "যদি সার্চ সাজেশন কাজ না করে",
    "ProxyText": "CORS বাইপাস প্রক্সি",
    "ProxySubtext": "নিজস্ব CORS বাইপাস প্রক্সি যোগ করুন",
    "HostproxyButton": "নিজস্ব প্রক্সি হোস্ট করুন",
    "ProxyDisclaimer": "সমস্ত প্রক্সি ফিচার ডিফল্টভাবে বন্ধ থাকে।\n\nআপনি যদি সার্চ সাজেশন এবং CORS বাইপাস প্রক্সি সক্রিয় করেন, তাহলে উন্নত গোপনীয়তার জন্য আপনার নিজস্ব প্রক্সি হোস্ট করার পরামর্শ দেওয়া হয়।\n\nডিফল্টভাবে প্রক্সি https://mynt-proxy.rhythmcorehq.com এ সেট করা হবে, যার মানে আপনার সমস্ত ডেটা এই পরিষেবার মাধ্যমে যাবে, যা গোপনীয়তার ঝুঁকি তৈরি করতে পারে।",

    // Weather
    "weatherSectionTitle": "আবহাওয়া",
    "hideWeatherTitle": "আবহাওয়া লুকান",
    "hideWeatherInfo": "আবহাওয়া উইজেট বন্ধ করুন",
    "hideWeatherBox": "আবহাওয়া কার্ড লুকান",
    "hideWeatherBoxInfo": "শুধুমাত্র তাপমাত্রা পিল দেখান",
    "minMaxTempText": "সর্বনিম্ন-সর্বাধিক তাপমাত্রা",
    "minMaxTempSubText": "অনুভূতি তাপমাত্রার পরিবর্তে সর্বনিম্ন ও সর্বাধিক তাপমাত্রা দেখান",

    // Fahrenheit
    "fahrenheitCelsiusCheckbox": "ফারেনহাইটে পরিবর্তন করুন",
    "fahrenheitCelsiusText": "পরিবর্তন প্রয়োগ করতে পেজ রিফ্রেশ করুন",

    // Location
    "UserLocText": "আপনার অবস্থান লিখুন",
    "UserLocSubtext": "যদি আবহাওয়া অবস্থান সঠিক না হয়",
    "userLoc": "আপনার শহর বা স্থানাঙ্ক (অক্ষাংশ, দ্রাঘিমাংশ)",
    "PrivacyPolicy": "গোপনীয়তা নীতি",

    // GPS
    "useGPS": "জিপিএস ব্যবহার করুন",
    "useGPSInfo": "লাইভ লোকেশন আপডেটের জন্য জিপিএস সক্ষম করুন",
    "GPSDisclaimer": "আপনার অবস্থানের তথ্য শুধুমাত্র সঠিক আবহাওয়ার আপডেট প্রদানের জন্য ব্যবহার করা হয়। এটি অস্থায়ীভাবে ব্রাউজারের মধ্যে সংরক্ষণ করা হয় এবং কোনও তৃতীয় পক্ষের পরিষেবার সাথে শেয়ার করা হয় না এবং আমাদের কাছে অ্যাক্সেসযোগ্যও নয়।\n\nজিপিএস সক্ষম করার মাধ্যমে, আপনি স্থানীয়ভাবে এক্সটেনশনের সাথে আপনার অবস্থান শেয়ার করে নেওয়ার জন্য সম্মতি দিচ্ছেন।",

    // WeatherAPI
    "WeatherApiText": "আপনার WeatherAPI কী লিখুন",
    "WeatherApiSubtext": "যদি আবহাওয়ার ফাংশন কাজ না করে",
    "userAPI": "আপনার WeatherAPI কী",
    "LearnMoreButton": "আরও জানুন",

    // Appearance
    "appearanceSectionTitle": "দৃশ্যরূপ",

    // Theme
    "lightThemed": "লাইট",
    "darkThemed": "ডার্ক",
    "systemThemed": "সিস্টেম",
    "rangColor": "রঙ নির্বাচন করুন",

    // Wallpaper
    "uploadWallpaperText": "ওয়ালপেপার দিন",
    "opacityTitle": "অস্বচ্ছতা",
    "adjustOpacityDesc": "ইন্টারফেসের স্বচ্ছতা সামঞ্জস্য করুন",

    // Wallpaper Alerts
    "confirmWallpaper": "আপনি কি আজকের জন্য একটি নতুন ছবি ওয়ালপেপার হিসেবে সেট করতে চান?",
    "Nobackgroundset": "বর্তমানে কোন ব্যাকগ্রাউন্ড ইমেজ সেট করা হয়নি।",
    "clearbackgroundimage": "আপনি কি ব্যাকগ্রাউন্ড ইমেজ মুছে ফেলতে চান?",

    // Settings
    "settingsSectionTitle": "সেটিংস",
    "backupText": "ব্যাকআপ করুন",
    "restoreText": "পুনরুদ্ধার করুন",
    "resetsettings": "সেটিংস পুনরায় সেট করুন",
    "menuCloseText": "বন্ধ করুন",

    // Backup and Restore Alerts
    "failedbackup": "ব্যাকআপ ব্যর্থ: ",
    "restorecompleted": "পুনরুদ্ধার সফলভাবে সম্পন্ন হয়েছে!",
    "restorefailed": "পুনরুদ্ধার ব্যর্থ: ",
    "invalidBackup": "অবৈধ ব্যাকআপ ফাইল নির্বাচিত হয়েছে।",
    "confirmRestore": "আপনি কি নিশ্চিত যে আপনি আপনার সেটিংস রিসেট করতে চান? এটি পূর্বাবস্থায় ফেরানো যাবে না।",

    // Tips
    "switchSearchModes": "সার্চ মোড পরিবর্তন করুন",
    "switchSearchModesInfo": "মোড পরিবর্তন করতে ‘দিয়ে সার্চ করুন’ এ ক্লিক করুন",
    "adjustZoom": "জুম সমন্বয় করুন",
    "adjustZoomInfo": "জুম সমন্বয় করতে Ctrl + \"+\" বা Ctrl + \"-\" চাপুন।",

    // Tips - Theme
    "changeBrowserTheme": "ব্রাউজারের থিম পরিবর্তন করুন",
    "chromeThemeInfo": "তিনটি ডট (⋮) এ ক্লিক করুন > আরও টুলস > ক্রোম কাস্টমাইজ করুন, তারপর এক্সটেনশনের থিমের সাথে মিলিয়ে একটি রঙ নির্বাচন করুন।",
    "edgeThemeInfo": "সেটিংসে যান > রূপ, তারপর এক্সটেনশনের থিমের সাথে মিলিয়ে একটি রঙ নির্বাচন করুন।",
    "braveThemeInfo": '<a href="https://chromewebstore.google.com/category/themes/" target="_blank">ক্রোম থিম স্টোর</a> এ যান, থিম ডাউনলোড করুন এবং এক্সটেনশনের থিমের সাথে মিলিয়ে একটি রঙ নির্বাচন করুন।',
    "firefoxThemeInfo": '<a href="https://addons.mozilla.org/firefox/themes/" target="_blank">ফায়ারফক্স থিম</a> এ যান, থিম ডাউনলোড করুন এবং এক্সটেনশনের থিমের সাথে মিলিয়ে একটি রঙ নির্বাচন করুন।',

    // Tips - Firefox
    "updateFirefoxHomepage": "হোমপেজ আপডেট করুন",
    "updateFirefoxHomepageInfo": "আপনার হোমপেজকে নতুন ট্যাবের মতো পরিবর্তন করতে, <a href=\"https://github.com/prem-k-r/MaterialYouNewTab#-firefox\" target=\"_blank\">এই লিংকে</a> যান এবং নির্দেশিকা অনুসরণ করুন।",
    "dontShowTips": "এটি আর দেখাবেন না"
};
