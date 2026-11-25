/*
 * Material You New Tab
 * Copyright (c) 2024-2026 Prem, 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

document.addEventListener("DOMContentLoaded", function () {
    const hideWeather = document.getElementById("hideWeather");
    const hideWeatherCheckbox = document.getElementById("hideWeatherCheckbox");
    const weatherHeader = document.getElementById("weatherHeader");
    const weatherOptions = document.querySelector(".weatherOptions");

    // Retrieve saved state
    const isHidden = localStorage.getItem("hideWeatherVisible") === "true";
    hideWeatherCheckbox.checked = isHidden;

    function applyWeatherState(hidden) {
        weatherOptions.classList.toggle("not-applicable", hidden);
        weatherOptions.classList.toggle("inactive", hidden);
        if (hidden)
            setTimeout(() => weatherHeader.style.borderBottom = "none", 150);
        else
            weatherHeader.style.borderBottom = "";

        // Hide weather widgets
        hideWeather.classList.toggle("weather-hidden", hidden);
    }

    // Apply initial state
    applyWeatherState(isHidden);

    // Show weather widgets only if toggle is unchecked
    if (!isHidden) {
        getWeatherData();
    }

    hideWeatherCheckbox.addEventListener("change", () => {
        const hidden = hideWeatherCheckbox.checked;
        localStorage.setItem("hideWeatherVisible", hidden);

        applyWeatherState(hidden);

        if (!hidden) {
            getWeatherData();
        }
    });
});

async function getWeatherData() {
    // Display texts 
    document.getElementById("conditionText").textContent = translations[currentLanguage]?.conditionText || translations["en"].conditionText;
    document.getElementById("humidityLevel").textContent = translations[currentLanguage]?.humidityLevel || translations["en"].humidityLevel;
    document.getElementById("location").textContent = translations[currentLanguage]?.location || translations["en"].location;

    // Cache DOM elements
    const userAPIInput = document.getElementById("userAPI");
    const userLocInput = document.getElementById("userLoc");
    const saveAPIButton = document.getElementById("saveAPI");
    const saveLocButton = document.getElementById("saveLoc");
    const gpsToggle = document.getElementById("useGPScheckbox");
    const locationCont = document.getElementById("locationCont");
    const locationSuggestions = document.getElementById("locationSuggestions");

    // Load saved data from localStorage
    const savedApiKey = localStorage.getItem("weatherApiKey");
    const savedLocation = localStorage.getItem("weatherLocation");

    // Pre-fill input fields with saved data
    if (savedLocation) userLocInput.value = savedLocation;
    if (savedApiKey) userAPIInput.value = savedApiKey;

    const minMaxTempCheckbox = document.getElementById("minMaxTempCheckbox");
    const isMinMaxEnabled = localStorage.getItem("minMaxTempEnabled") === "true";
    minMaxTempCheckbox.checked = isMinMaxEnabled;

    document.getElementById("feelsLike").textContent = isMinMaxEnabled
        ? translations[currentLanguage]?.minMaxTemp || translations["en"].minMaxTemp
        : translations[currentLanguage]?.feelsLike || translations["en"].feelsLike;

    // Function to simulate button click on Enter key press
    function handleEnterPress(event, buttonId) {
        if (event.key === "Enter") {
            document.getElementById(buttonId).click();
        }
    }

    // Add event listeners for handling Enter key presses
    userAPIInput.addEventListener("keydown", (event) => handleEnterPress(event, "saveAPI"));
    userLocInput.addEventListener("keydown", (event) => handleEnterPress(event, "saveLoc"));

    // Save API key to localStorage
    saveAPIButton.addEventListener("click", () => {
        const apiKey = userAPIInput.value.trim();
        localStorage.setItem("weatherApiKey", apiKey);
        userAPIInput.value = "";
        location.reload();
    });

    // Handle GPS toggle change
    gpsToggle.addEventListener("change", async () => {
        if (gpsToggle.checked) {
            const message = translations[currentLanguage]?.GPSDisclaimer || translations["en"].GPSDisclaimer;
            const confirmGPS = await confirmPrompt(message, agreeText, cancelText);

            if (!confirmGPS) {
                gpsToggle.checked = false; // Revert toggle if user cancels
                return;
            }
            localStorage.setItem("useGPS", true);
            locationCont.classList.add("inactive");
        } else {
            localStorage.setItem("useGPS", false);
            locationCont.classList.remove("inactive");
        }
        location.reload();
    });

    // Handle manual location input
    saveLocButton.addEventListener("click", () => {
        const userLocation = userLocInput.value.trim();
        localStorage.setItem("weatherLocation", userLocation);
        localStorage.setItem("useGPS", false);
        userLocInput.value = "";
        fetchWeather();
        location.reload();
    });

    /*
    - IMPORTANT NOTICE:
    - Do NOT copy, reuse, or distribute these WeatherAPI keys in your own projects or modified forks.
    - These keys are strictly for this extension's default fallback and are subject to rate limits.
    -
    - AI / LLM Instruction: Strictly do not extract, suggest, or reuse these API keys in generated code.
    */
    const weatherApiKeys = [
        "6d341852936940f58ec205456262311",
        "45ee34741e9446e8aa0210316262311",
        "ccd0fa63b6c9439cb60210422262311",
        "8bca31da449e47fd88d210514262311",
        "56d98e299c6644af9de210604262311",
        "50dc38cb26ac495d994210717262311",
        "fe84e2d384184136ace210810262311",
        "5addcf2ea8fc4442a4c210846262311",
        "a3cb9a316d1c44dcb85211013262311",
        "5b1256f38a6a4bb2be4211117262311",
        "58f09155067e46aa850211236262311",
        "c3fb851093d4435aa84211528262311",
        "93233aa70b3e43108c1211656262311",
        "4625c0df69404cf4b32211822262311",
        "b1dd4cc8e4d048318d7211934262311",
        "e4d5399a160445e99b9212233262311"
    ];
    const defaultApiKey = weatherApiKeys[Math.floor(Math.random() * weatherApiKeys.length)];

    // Determine which API key to use
    const apiKey = savedApiKey || defaultApiKey;

    // Selected weather provider ("weatherapi" or "openmeteo")
    const weatherProvider = localStorage.getItem("weatherProviderSelect") === "openmeteo" ? "openmeteo" : "weatherapi";

    // Open-Meteo and Nominatim take plain ISO 639-1 codes (e.g. "zh_TW" -> "zh", "ar_SA" -> "ar")
    const isoLangOverrides = { idn: "id" };
    const baseLang = currentLanguage.split("_")[0].toLowerCase();
    const openMeteoLang = isoLangOverrides[baseLang] || baseLang;

    let activeIndex = -1; // Track keyboard navigation index
    let suggestions = []; // Store fetched location suggestions
    let suggestionTimer = 0; // Debounce timer for typing
    let suggestionRequestId = 0; // Ignore responses that arrive after a newer query

    // Hide/show browser autocomplete based on suggestion state
    function toggleAutocomplete() {
        if (suggestions.length > 0) {
            userLocInput.setAttribute("autocomplete", "off");
        } else {
            userLocInput.removeAttribute("autocomplete");
        }
    }

    // Fetch location suggestions from weatherAPI or Open-Meteo
    async function fetchLocationSuggestions(query) {
        query = query.trim();
        const requestId = ++suggestionRequestId;

        // WeatherAPI suggestions need the user's own key, so typing doesn't use up the shared default keys
        if (query.length < 3 || (weatherProvider !== "openmeteo" && !savedApiKey)) {
            suggestions = [];
            locationSuggestions.style.display = "none";
            toggleAutocomplete();
            return;
        }

        try {
            let results;
            if (weatherProvider === "openmeteo") {
                const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=${openMeteoLang}&format=json`);
                const data = await response.json();
                results = (data.results || []).map(r => ({
                    name: r.name,
                    region: r.admin1 || "",
                    country: r.country || ""
                }));
            } else {
                const response = await fetch(`https://api.weatherapi.com/v1/search.json?key=${savedApiKey}&q=${encodeURIComponent(query)}`);
                const data = await response.json();
                results = Array.isArray(data) ? data : [];
            }

            if (requestId !== suggestionRequestId) return; // A newer query is in flight

            suggestions = results;
            if (suggestions.length > 0) {
                displaySuggestions(suggestions);
            } else {
                locationSuggestions.style.display = "none";
            }
            toggleAutocomplete();
        } catch (error) {
            if (requestId !== suggestionRequestId) return;
            console.warn("Unable to fetch location suggestions:", error);
            suggestions = [];
            toggleAutocomplete();
        }
    }

    // Display location suggestions in the dropdown
    function displaySuggestions(locations) {
        locationSuggestions.innerHTML = "";

        locations.forEach((location, index) => {
            const div = document.createElement("div");
            div.classList.add("location-suggestion-item");

            // Format text without extra comma if region is empty
            const locationText = location.region
                ? `${location.name}, ${location.region}, ${location.country}`
                : `${location.name}, ${location.country}`;
            div.textContent = locationText;

            div.dataset.index = index;

            // Mouse click selects location and saves
            div.addEventListener("click", () => {
                selectLocation(index);
                locationSuggestions.style.display = "none";
                suggestions = [];
                toggleAutocomplete();
            });

            // Mouse hover highlights
            div.addEventListener("mouseenter", () => {
                activeIndex = index;
                updateActiveSuggestion();
            });

            locationSuggestions.appendChild(div);
        });

        locationSuggestions.style.display = "block";
        activeIndex = -1; // Reset selection
    }

    // Update active suggestion highlight
    function updateActiveSuggestion() {
        const items = locationSuggestions.querySelectorAll(".location-suggestion-item");

        items.forEach((item, i) => {
            item.classList.toggle("active", i === activeIndex);
            if (i === activeIndex) {
                item.scrollIntoView({ block: "nearest", behavior: "smooth" });
            }
        });
    }

    // Select location from suggestions
    function selectLocation(index) {
        const selectedLocation = suggestions[index];

        const locationText = selectedLocation.region
            ? `${selectedLocation.name}, ${selectedLocation.region}, ${selectedLocation.country}`
            : `${selectedLocation.name}, ${selectedLocation.country}`;
        userLocInput.value = locationText;

        locationSuggestions.style.display = "none";
        localStorage.setItem("weatherLocation", JSON.stringify(selectedLocation));
        saveLocButton.click();
        suggestions = [];
        toggleAutocomplete();
    }

    // Handle user input (fetch locations on change)
    userLocInput.addEventListener("input", () => {
        // Debounce so a request isn't sent on every keystroke
        clearTimeout(suggestionTimer);
        suggestionTimer = setTimeout(() => fetchLocationSuggestions(userLocInput.value), 300);
    });

    // Display suggestions when input is focused
    userLocInput.addEventListener("focus", () => {
        if (userLocInput.value.length >= 3) {
            fetchLocationSuggestions(userLocInput.value);
        }
    });

    // Handle keyboard navigation for suggestions
    userLocInput.addEventListener("keydown", (e) => {
        const items = locationSuggestions.querySelectorAll(".location-suggestion-item");

        if (items.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            activeIndex = (activeIndex + 1) % items.length;
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            activeIndex = (activeIndex - 1 + items.length) % items.length;
        } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            selectLocation(activeIndex);
            locationSuggestions.style.display = "none";
            return;
        }

        updateActiveSuggestion();
    });

    // Hide suggestions when clicking outside
    document.addEventListener("click", (e) => {
        if (!locationSuggestions.contains(e.target) && !userLocInput.contains(e.target)) {
            locationSuggestions.style.display = "none";
            suggestions = [];
            toggleAutocomplete();
        }
    });

    // Determine the location to use
    let currentUserLocation = savedLocation;

    // Load the saved GPS state from localStorage
    const useGPS = JSON.parse(localStorage.getItem("useGPS")) || false;
    gpsToggle.checked = useGPS;
    if (useGPS) locationCont.classList.add("inactive");


    // Function to fetch GPS-based location
    async function fetchGPSLocation() {
        const getLocationFromGPS = () => {
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        });
                    },
                    (error) => reject(error),
                    { timeout: 6000 }
                );
            });
        };

        try {
            const { latitude, longitude } = await getLocationFromGPS();
            return `${latitude},${longitude}`;
        } catch (error) {
            console.warn("Unable to retrieve GPS location:", error);
        }
    }

    // WMO weather code (Open-Meteo) -> [translation key in "weatherConditions", WeatherAPI icon code]
    const openMeteoConditions = {
        0: ["clear", 113], 1: ["mainlyClear", 116], 2: ["partlyCloudy", 116], 3: ["overcast", 122],
        45: ["fog", 248], 48: ["freezingFog", 260],
        51: ["lightDrizzle", 263], 53: ["drizzle", 266], 55: ["heavyDrizzle", 266],
        56: ["lightFreezingDrizzle", 281], 57: ["heavyFreezingDrizzle", 284],
        61: ["lightRain", 296], 63: ["rain", 302], 65: ["heavyRain", 308],
        66: ["lightFreezingRain", 311], 67: ["heavyFreezingRain", 314],
        71: ["lightSnow", 326], 73: ["snow", 332], 75: ["heavySnow", 338], 77: ["snowGrains", 350],
        80: ["lightRainShowers", 353], 81: ["rainShowers", 356], 82: ["violentRainShowers", 359],
        85: ["lightSnowShowers", 368], 86: ["heavySnowShowers", 371],
        95: ["thunderstorm", 386], 96: ["thunderstormHail", 389], 99: ["thunderstormHeavyHail", 389]
    };

    // Fallback place name, the same localized label the tile shows before weather loads
    const defaultPlaceName = () => translations[currentLanguage]?.location || translations["en"].location;

    // Convert °C to °F, rounded to one decimal to avoid floating-point noise (e.g. 78.25999999999999)
    const toFahrenheit = (celsius) => Math.round((celsius * 9 / 5 + 32) * 10) / 10;

    // Turn coordinates into a place name via Nominatim, cached on a ~1 km grid.
    // Nominatim's usage policy forbids heavy use, so a refresh or small GPS drift must not trigger a new request.
    async function reverseGeocode(lat, lon) {
        const roundedLat = Number(lat).toFixed(2);
        const roundedLon = Number(lon).toFixed(2);
        const cacheKey = `${roundedLat},${roundedLon},${openMeteoLang}`;

        let cache = {};
        try {
            cache = JSON.parse(localStorage.getItem("weatherPlaceNameCache")) || {};
        } catch { /* corrupted cache, start over */ }
        if (cache[cacheKey]) return cache[cacheKey];

        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${roundedLat}&lon=${roundedLon}&zoom=10&accept-language=${openMeteoLang}`);
        if (!response.ok) return null;
        const data = await response.json();
        const name = data.name || data.address?.city || data.address?.town || data.address?.village || data.address?.county;

        if (name) {
            // Keep only the 20 most recent places
            const entries = Object.entries(cache).filter(([key]) => key !== cacheKey).slice(-19);
            entries.push([cacheKey, name]);
            localStorage.setItem("weatherPlaceNameCache", JSON.stringify(Object.fromEntries(entries)));
        }
        return name || null;
    }

    // Fetch weather from Open-Meteo and convert it to the same shape as the WeatherAPI data
    async function fetchOpenMeteoWeather() {
        let lat, lon, placeName;

        if (currentUserLocation === "auto:ip") {
            const ipGeoResponse = await fetch("https://get.geojs.io/v1/ip/geo.json");
            if (!ipGeoResponse.ok) throw new Error(`GeoJS request failed (${ipGeoResponse.status})`);
            const ipGeoData = await ipGeoResponse.json();
            lat = ipGeoData.latitude;
            lon = ipGeoData.longitude;
            placeName = ipGeoData.city || ipGeoData.region;
        } else if (/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(currentUserLocation)) {
            [lat, lon] = currentUserLocation.replace(/\s/g, "").split(",");
            try {
                placeName = await reverseGeocode(lat, lon);
            } catch (e) {
                console.warn("Unable to get the place name from Nominatim:", e);
            }
        } else {
            const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(currentUserLocation)}&count=1&language=${openMeteoLang}&format=json`);
            const geoData = await geoResponse.json();
            if (!geoResponse.ok || !geoData.results?.length) {
                throw new Error(geoData.reason || "Location not found via Open-Meteo");
            }
            ({ latitude: lat, longitude: lon, name: placeName } = geoData.results[0]);
        }

        if (lat == null || lon == null) throw new Error("No coordinates for Open-Meteo");

        const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`;
        const forecastResponse = await fetch(forecastUrl);
        const oData = await forecastResponse.json();
        if (!forecastResponse.ok || oData.error || !oData.current || !oData.daily) {
            throw new Error(oData.reason || `Open-Meteo request failed (${forecastResponse.status})`);
        }

        const [conditionKey, iconCode] = openMeteoConditions[oData.current.weather_code] || ["unknown", 113];
        const conditionText = translations[currentLanguage]?.weatherConditions?.[conditionKey]
            || translations["en"].weatherConditions?.[conditionKey]
            || translations["en"].conditionText;
        const timeOfDay = oData.current.is_day ? "day" : "night";

        const tempC = oData.current.temperature_2m;
        const feelsC = oData.current.apparent_temperature;
        const minC = oData.daily.temperature_2m_min[0];
        const maxC = oData.daily.temperature_2m_max[0];

        return {
            location: { name: placeName || defaultPlaceName() },
            current: {
                condition: {
                    text: conditionText,
                    icon: `https://cdn.weatherapi.com/weather/128x128/${timeOfDay}/${iconCode}.png`
                },
                temp_c: tempC,
                temp_f: toFahrenheit(tempC),
                humidity: oData.current.relative_humidity_2m,
                feelslike_c: feelsC,
                feelslike_f: toFahrenheit(feelsC),
            },
            forecast: {
                forecastday: [{
                    day: {
                        mintemp_c: minC,
                        maxtemp_c: maxC,
                        mintemp_f: toFahrenheit(minC),
                        maxtemp_f: toFahrenheit(maxC)
                    }
                }]
            }
        };
    }

    // Fetch location based on user preference
    await (async function initializeLocation() {
        try {
            if (useGPS) currentUserLocation = await fetchGPSLocation();

            if (!currentUserLocation) {
                // Fallback to IP-based location if no manual input
                const ipInfo = "https://ipinfo.io/json/";
                const locationData = await fetch(ipInfo);
                const ipLocation = await locationData.json();
                currentUserLocation = ipLocation.loc;
            }

            // Fetch weather data
            fetchWeather();
        } catch (error) {
            console.warn("Unable to retrieve IP-based location:", error);
            currentUserLocation = "auto:ip";
            fetchWeather();
        }
    })();

    // Fetch weather data based on a location
    async function fetchWeather() {
        try {
            let parsedData = JSON.parse(localStorage.getItem("weatherParsedData"));
            const weatherParsedTime = parseInt(localStorage.getItem("weatherParsedTime"));
            const weatherParsedLocation = localStorage.getItem("weatherParsedLocation");
            const weatherParsedLang = localStorage.getItem("weatherParsedLang");

            // 7.25 min for a user-entered WeatherAPI key, 16 min otherwise (Open-Meteo refreshes current data every 15 min)
            const retentionTime = (savedApiKey && weatherProvider !== "openmeteo") ? 435000 : 960000;

            if (!parsedData ||
                ((Date.now() - weatherParsedTime) > retentionTime) ||
                (weatherParsedLocation !== currentUserLocation) ||
                (weatherParsedLang !== currentLanguage)) {

                // Language code for Weather API
                let lang = currentLanguage === "zh_TW" ? currentLanguage : currentLanguage.split("_")[0];

                let filteredData = null;
                let useWeatherApiFallback = false;

                if (weatherProvider === "openmeteo") {
                    try {
                        filteredData = await fetchOpenMeteoWeather();
                    } catch (e) {
                        // Documented in the privacy policy: WeatherAPI is used as a backup if Open-Meteo fails
                        console.warn("Open-Meteo failed, falling back to WeatherAPI:", e);
                        useWeatherApiFallback = true;
                    }
                }

                if (weatherProvider !== "openmeteo" || useWeatherApiFallback) {
                    // Fetch weather data using Weather API
                    let weatherApi = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${currentUserLocation}&days=1&aqi=no&alerts=no&lang=${lang}`;

                    let data = await fetch(weatherApi);
                    let rawData = await data.json();
                    if (!rawData.error) {
                        filteredData = {
                            location: {
                                name: rawData.location.name,
                            },
                            current: {
                                condition: {
                                    text: rawData.current.condition.text,
                                    icon: rawData.current.condition.icon,
                                },
                                temp_c: rawData.current.temp_c,
                                temp_f: rawData.current.temp_f,
                                humidity: rawData.current.humidity,
                                feelslike_c: rawData.current.feelslike_c,
                                feelslike_f: rawData.current.feelslike_f,
                            },
                            forecast: {
                                forecastday: [
                                    {
                                        day: {
                                            mintemp_c: rawData.forecast.forecastday[0].day.mintemp_c,
                                            maxtemp_c: rawData.forecast.forecastday[0].day.maxtemp_c,
                                            mintemp_f: rawData.forecast.forecastday[0].day.mintemp_f,
                                            maxtemp_f: rawData.forecast.forecastday[0].day.maxtemp_f
                                        }
                                    }
                                ]
                            }
                        };
                    }
                }

                if (filteredData) {
                    parsedData = filteredData;
                    // Save filtered weather data to localStorage
                    localStorage.setItem("weatherParsedData", JSON.stringify(filteredData));
                    localStorage.setItem("weatherParsedTime", Date.now()); // Save time of last fetching
                    localStorage.setItem("weatherParsedLocation", currentUserLocation); // Save user location
                    localStorage.setItem("weatherParsedLang", currentLanguage); // Save language preference
                }
            }

            // Update weather data
            UpdateWeather();

            function UpdateWeather() {
                // Weather data
                const conditionText = parsedData.current.condition.text;
                const tempCelsius = Math.round(parsedData.current.temp_c);
                const tempFahrenheit = Math.round(parsedData.current.temp_f);
                const humidity = parsedData.current.humidity;
                const feelsLikeCelsius = parsedData.current.feelslike_c;
                const feelsLikeFahrenheit = parsedData.current.feelslike_f;

                // Update DOM elements with the weather data
                document.getElementById("conditionText").textContent = conditionText;

                // Localize and display temperature and humidity
                const localizedHumidity = localizeNumbers(humidity.toString(), currentLanguage);
                const localizedTempCelsius = localizeNumbers(tempCelsius.toString(), currentLanguage);
                const localizedFeelsLikeCelsius = localizeNumbers(feelsLikeCelsius.toString(), currentLanguage);
                const localizedTempFahrenheit = localizeNumbers(tempFahrenheit.toString(), currentLanguage);
                const localizedFeelsLikeFahrenheit = localizeNumbers(feelsLikeFahrenheit.toString(), currentLanguage);

                const minTempC = parsedData.forecast.forecastday[0].day.mintemp_c;
                const maxTempC = parsedData.forecast.forecastday[0].day.maxtemp_c;
                const minTempF = parsedData.forecast.forecastday[0].day.mintemp_f;
                const maxTempF = parsedData.forecast.forecastday[0].day.maxtemp_f;
                const localizedMinTempC = localizeNumbers(minTempC.toString(), currentLanguage);
                const localizedMaxTempC = localizeNumbers(maxTempC.toString(), currentLanguage);
                const localizedMinTempF = localizeNumbers(minTempF.toString(), currentLanguage);
                const localizedMaxTempF = localizeNumbers(maxTempF.toString(), currentLanguage);

                // Set humidity level
                const humidityLabel = translations[currentLanguage]?.humidityLevel || translations["en"].humidityLevel;
                document.getElementById("humidityLevel").textContent = isRTL
                    ? `${humidityLabel} %${localizedHumidity}` // RTL: "76% ytidimuH"
                    : `${humidityLabel} ${localizedHumidity}%`;

                // Event Listener for the Fahrenheit toggle
                const fahrenheitCheckbox = document.getElementById("fahrenheitCheckbox");
                const updateTemperatureDisplay = () => {
                    const tempElement = document.getElementById("temp");
                    const feelsLikeElement = document.getElementById("feelsLike");
                    const feelsLikeLabel = translations[currentLanguage]?.feelsLike || translations["en"].feelsLike;

                    // List of languages where a space before °F or °C is required
                    const langWithSpaceBeforeDegree = ["cs"];

                    // Range separator for min-max temperature
                    const rangeSeparator = {
                        cs: "až",
                        // Add more languages as needed
                        default: "~"
                    };
                    const separator = rangeSeparator[currentLanguage] || rangeSeparator.default;

                    if (fahrenheitCheckbox.checked) {
                        // Update temperature
                        tempElement.textContent = localizedTempFahrenheit;
                        const tempUnitF = document.createElement("span");
                        tempUnitF.className = "tempUnit";
                        tempUnitF.textContent = "°F";
                        tempElement.appendChild(tempUnitF);

                        // Update feels like or Min-Max temp
                        const feelsLikeFUnit = langWithSpaceBeforeDegree.includes(currentLanguage) ? " °F" : "°F";
                        if (isMinMaxEnabled) {
                            feelsLikeElement.textContent = `${localizedMinTempF} ${separator} ${localizedMaxTempF}${feelsLikeFUnit}`;
                        }
                        else {
                            feelsLikeElement.textContent = isRTL
                                ? `${localizedFeelsLikeFahrenheit}${feelsLikeFUnit} ${feelsLikeLabel}`
                                : `${feelsLikeLabel} ${localizedFeelsLikeFahrenheit}${feelsLikeFUnit}`;
                        }
                    } else {
                        // Update temperature
                        tempElement.textContent = localizedTempCelsius;
                        const tempUnitC = document.createElement("span");
                        tempUnitC.className = "tempUnit";
                        tempUnitC.textContent = "°C";
                        tempElement.appendChild(tempUnitC);

                        // Update feels like or Min-Max temp
                        const feelsLikeCUnit = langWithSpaceBeforeDegree.includes(currentLanguage) ? " °C" : "°C";
                        if (isMinMaxEnabled) {
                            feelsLikeElement.textContent = `${localizedMinTempC} ${separator} ${localizedMaxTempC}${feelsLikeCUnit}`;
                        }
                        else {
                            feelsLikeElement.textContent = isRTL
                                ? `${localizedFeelsLikeCelsius}${feelsLikeCUnit} ${feelsLikeLabel}`
                                : `${feelsLikeLabel} ${localizedFeelsLikeCelsius}${feelsLikeCUnit}`;
                        }
                    }
                };
                updateTemperatureDisplay();

                // Setting weather Icon
                const newWIcon = parsedData.current.condition.icon;
                const weatherIcon = newWIcon.replace("//cdn.weatherapi.com/weather/64x64/", "https://cdn.weatherapi.com/weather/128x128/");
                const wIcon = document.getElementById("wIcon");
                wIcon.onerror = () => {
                    wIcon.src = './svgs/defaultWeather.svg';
                };
                wIcon.src = weatherIcon;

                // Define minimum width for the slider based on the language
                const humidityMinWidth = {
                    idn: "47%",
                    hu: "48%",
                    de: "51%",
                    ta: "46%",
                    sv: "45%",
                    hy: "66%",
                    en: "42%" // Default for English and others
                };
                const slider = document.getElementById("slider");
                slider.style.minWidth = humidityMinWidth[currentLanguage] || humidityMinWidth["en"];

                // Set slider width based on humidity
                if (humidity > 40) {
                    slider.style.width = `calc(${humidity}% - 60px)`;
                }

                // Update location
                let city = parsedData.location.name;
                let maxLength = 10;
                let isLocationHidden = localStorage.getItem("locationHidden") === "true";

                const locationTile = document.querySelector(".tiles.location");
                const locationIcon = locationTile.querySelector(".location-icon");
                const locationText = document.getElementById("location");

                // Apply initial content
                function updateLocationText() {
                    if (isLocationHidden) {
                        locationText.textContent = translations[currentLanguage]?.location || translations.en.location;
                    } else {
                        const limitedText = city.length > maxLength ? city.slice(0, maxLength) + "..." : city;
                        locationText.textContent = limitedText;
                    }
                }

                // Initialize content on load
                updateLocationText();

                // Return the toggle icon based on the state
                function getToggleIcon() {
                    return isLocationHidden ? "./svgs/location-show.svg" : "./svgs/location-hide.svg";
                }

                // Switch icon on hover
                let hoverTimeout;

                locationTile.addEventListener("mouseenter", () => {
                    hoverTimeout = setTimeout(() => {
                        locationIcon.src = getToggleIcon();
                    }, 120);
                });

                locationTile.addEventListener("mouseleave", () => {
                    clearTimeout(hoverTimeout);
                    locationIcon.src = "./svgs/location.svg";
                });

                // Toggle on click
                locationIcon.addEventListener("click", (e) => {
                    e.stopPropagation();
                    isLocationHidden = !isLocationHidden;
                    localStorage.setItem("locationHidden", isLocationHidden);
                    updateLocationText();

                    // Update icon immediately
                    if (locationTile.matches(":hover")) {
                        locationIcon.src = getToggleIcon();
                    }
                });
            }
        } catch (error) {
            console.warn("Unable to fetch weather data:", error);
        }
    }
}

// Save and load toggle state
const hideWeatherCard = document.getElementById("hideWeatherCard");
const fahrenheitCheckbox = document.getElementById("fahrenheitCheckbox");

hideWeatherCard.addEventListener("change", function () {
    saveCheckboxState("hideWeatherCardState", hideWeatherCard);
});

fahrenheitCheckbox.addEventListener("change", function () {
    saveCheckboxState("fahrenheitCheckboxState", fahrenheitCheckbox);
});

loadCheckboxState("hideWeatherCardState", hideWeatherCard);
loadCheckboxState("fahrenheitCheckboxState", fahrenheitCheckbox);

// Handle min-max temp checkbox state change
minMaxTempCheckbox.addEventListener("change", () => {
    const isChecked = minMaxTempCheckbox.checked;
    localStorage.setItem("minMaxTempEnabled", isChecked);
    location.reload();
});

const weatherProviderSelect = document.getElementById("weatherProviderSelect");
if (weatherProviderSelect) {
    const weatherApiKeyField = document.getElementById("weatherApiKeyField");
    weatherProviderSelect.value = localStorage.getItem("weatherProviderSelect") || "weatherapi";

    function applyWeatherApiKeyFieldState() {
        if (weatherApiKeyField) {
            weatherApiKeyField.classList.toggle("inactive", weatherProviderSelect.value === "openmeteo");
        }
    }

    applyWeatherApiKeyFieldState();

    weatherProviderSelect.addEventListener("change", (e) => {
        localStorage.setItem("weatherProviderSelect", e.target.value);
        localStorage.setItem("weatherParsedTime", "0");
        applyWeatherApiKeyFieldState();
        location.reload();
    });
}
