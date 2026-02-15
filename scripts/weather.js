/*
 * Material You NewTab
 * Copyright (c) 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

// Debug mode flag - set to false for production
const DEBUG_MODE = false;

function debugLog(...args) {
    if (DEBUG_MODE) {
        console.log(...args);
    }
}

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
    debugLog("getWeatherData() initialized");

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
    let savedLocation = localStorage.getItem("weatherLocation");

    // Normalize location storage to always use JSON format with validation
    let locationData = null;
    if (savedLocation) {
        try {
            locationData = JSON.parse(savedLocation);

            // Validate if it's a proper structured location object (has required fields)
            if (locationData && 
                typeof locationData === 'object' && 
                locationData.name) {
                
                if (locationData.isPlainText) {
                    // Plain text location - unchanged
                    debugLog("Loaded plain text location:", locationData.name);
                    userLocInput.value = locationData.name;
                } else {
                    // Structured location - require BOTH valid lat AND lon coordinates
                    const hasValidLat = typeof locationData.lat === 'number' && !isNaN(locationData.lat) && isFinite(locationData.lat);
                    const hasValidLon = typeof locationData.lon === 'number' && !isNaN(locationData.lon) && isFinite(locationData.lon);
                    
                    if (hasValidLat && hasValidLon) {
                        // Only treat as structured location if both coordinates are valid
                        debugLog("Loaded structured location with valid coordinates:", {lat: locationData.lat, lon: locationData.lon});
                        userLocInput.value = locationData.region
                            ? `${locationData.name}, ${locationData.region}, ${locationData.country}`
                            : `${locationData.name}, ${locationData.country}`;
                    } else {
                        // Invalid coordinates - treat as corrupted data
                        console.warn("Structured location missing valid coordinates, clearing:", {
                            lat: locationData.lat, 
                            lon: locationData.lon,
                            hasValidLat, 
                            hasValidLon
                        });
                        localStorage.removeItem("weatherLocation");
                        userLocInput.value = "";
                        locationData = null;
                    }
                }
            } else {
                // Invalid/malformed data - clear it and reset
                console.warn("Invalid weatherLocation data found, clearing:", locationData);
                localStorage.removeItem("weatherLocation");
                userLocInput.value = "";
                locationData = null;
            }
        } catch (e) {
            // Invalid JSON - clear it
            console.warn("Invalid JSON in weatherLocation, clearing:", savedLocation);
            localStorage.removeItem("weatherLocation");
            userLocInput.value = "";
            locationData = null;
        }
    } else {
        debugLog("No saved location found");
    }

    if (savedApiKey) {
        debugLog("Loaded saved API key");
        userAPIInput.value = savedApiKey;
    }

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
        window.location.reload();
    });

    // Handle GPS toggle change (IP-based location for extensions)
    gpsToggle.addEventListener("change", async () => {
        debugLog("GPS toggle clicked. Checked:", gpsToggle.checked);

        if (gpsToggle.checked) {
            debugLog("Requesting IP-based location...");
            try {
                const ipLocation = await fetchIPBasedLocation();

                if (ipLocation) {
                    debugLog("IP location obtained:", ipLocation);
                    localStorage.setItem("useGPS", true);
                    locationCont.classList.add("inactive");
                    debugLog("IP location enabled, reloading...");
                    window.location.reload();
                } else {
                    throw new Error("Could not fetch location");
                }
            } catch (error) {
                console.error("IP location fetch failed:", error);
                gpsToggle.checked = false;
                alert("Could not fetch your location. Try manual entry.");
            }
        } else {
            debugLog("IP location disabled");
            localStorage.setItem("useGPS", false);
            locationCont.classList.remove("inactive");
            window.location.reload();
        }
    });

    // Handle manual location input
    saveLocButton.addEventListener("click", () => {
        const userLocation = userLocInput.value.trim();
        
        // Validate input - don't save empty locations
        if (!userLocation) {
            alert("Please enter a location name before saving.");
            return;
        }
        
        debugLog("Saving manual plain text location:", userLocation);
        // Store as normalized JSON format with plain text flag
        const normalizedLocation = JSON.stringify({
            name: userLocation,
            isPlainText: true
        });
        localStorage.setItem("weatherLocation", normalizedLocation);
        
        // Clear caches to force refresh
        localStorage.removeItem("weatherLocationQuery");
        localStorage.removeItem("weatherParsedData");
        localStorage.removeItem("weatherParsedTime");
        localStorage.removeItem("weatherParsedLocation");
        localStorage.setItem("useGPS", false);
        userLocInput.value = "";
        window.location.reload();
    });

    // Default Weather API key rotation
    const weatherApiKeys = [
        "d36ce712613d4f21a6083436240910",
        "db0392b338114f208ee135134240312",
        "de5f7396db034fa2bf3140033240312",
        "c64591e716064800992140217240312",
        "9b3204c5201b4b4d8a2140330240312",
        "eb8a315c15214422b60140503240312",
        "cd148ebb1b784212b74140622240312",
        "7ae67e219af54df2840140801240312",
        "0a6bc8a404224c8d89953341241912",
        "f59e58d7735d4739ae953115241912",
        "17859d22a346495c988115334252703",
        "97cc2ef3bc4f45b3b0d120816252703",
        "51348f046e3f47ee99d120933252703",
        "ddbba7cc66044f96b43121046252703",
        "ab1b595515084775be2121201252703"
    ];
    const defaultApiKey = weatherApiKeys[Math.floor(Math.random() * weatherApiKeys.length)];

    // Determine which API key to use
    const apiKey = savedApiKey || defaultApiKey;
    debugLog("Using API key:", apiKey ? "saved" : "default");

    let activeIndex = -1; // Track keyboard navigation index
    let suggestions = []; // Store fetched location suggestions

    // Hide/show browser autocomplete based on suggestion state
    function toggleAutocomplete() {
        if (suggestions.length > 0) {
            userLocInput.setAttribute("autocomplete", "off");
        } else {
            userLocInput.removeAttribute("autocomplete");
        }
    }

    // Fetch location suggestions from weatherAPI
    async function fetchLocationSuggestions(query) {
        if (!savedApiKey || query.length < 3) {
            suggestions = [];
            locationSuggestions.style.display = "none";
            toggleAutocomplete();
            return;
        }

        try {
            debugLog("Fetching location suggestions for:", query);
            const response = await fetch(`https://api.weatherapi.com/v1/search.json?key=${savedApiKey}&q=${query}`);
            suggestions = await response.json();

            if (suggestions.length > 0) {
                debugLog("Found", suggestions.length, "location suggestions");
                displaySuggestions(suggestions);
                toggleAutocomplete();
            } else {
                locationSuggestions.style.display = "none";
                toggleAutocomplete();
            }
        } catch (error) {
            console.error("Error fetching location suggestions:", error);
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

        debugLog("Selected structured location:", selectedLocation);
        locationSuggestions.style.display = "none";
        
        // Store the full object and the lat,lon query separately
        localStorage.setItem("weatherLocation", JSON.stringify(selectedLocation));
        localStorage.setItem("weatherLocationQuery", `${selectedLocation.lat},${selectedLocation.lon}`);
        
        // Clear cached weather data to force refresh with new location
        localStorage.removeItem("weatherParsedData");
        localStorage.removeItem("weatherParsedTime");
        localStorage.removeItem("weatherParsedLocation");
        localStorage.setItem("useGPS", false);
        userLocInput.value = "";
        
        // Cleanup before reload
        suggestions = [];
        toggleAutocomplete();
        
        window.location.reload();
    }

    // Handle user input (fetch locations on change)
    userLocInput.addEventListener("input", () => {
        fetchLocationSuggestions(userLocInput.value);
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

        if (items.length === 0) return; // If no suggestions, let other listeners handle the event

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
    let currentUserLocation = null;

    // Load the saved GPS state from localStorage
    const useGPS = JSON.parse(localStorage.getItem("useGPS")) || false;
    gpsToggle.checked = useGPS;
    if (useGPS) {
        locationCont.classList.add("inactive");
        debugLog("IP location (useGPS) is enabled");
    }

    // Fetch location via IP geolocation (works in extensions)
    async function fetchIPBasedLocation() {
        try {
            debugLog("fetchIPBasedLocation() called");
            const response = await fetch("https://ipinfo.io/json/");
            
            // Check HTTP status before parsing JSON
            if (!response.ok) {
                console.error("IP geolocation failed - HTTP", response.status, response.statusText);
                return null;
            }
            
            const data = await response.json();
            debugLog("IP location response:", data);
            return data.loc; // Returns "lat,lon"
        } catch (error) {
            console.error("IP geolocation failed:", error);
            return null;
        }
    }

    // Initialize location resolution
    await (async function initializeLocation() {
        debugLog("initializeLocation() - useGPS:", useGPS, "locationData:", !!locationData);
        try {
            if (useGPS) {
                currentUserLocation = await fetchIPBasedLocation();

                if (!currentUserLocation) {
                    throw new Error("IP location failed");
                }

                // IP location must dominate - clear manual location data
                localStorage.removeItem("weatherLocation");
                localStorage.removeItem("weatherLocationQuery");
                debugLog("Using IP location:", currentUserLocation);
            }
            else if (locationData && locationData.isPlainText) {
                // Plain text location (manual input)
                localStorage.removeItem("weatherLocationQuery");
                currentUserLocation = locationData.name;
                debugLog("Using plain text location:", currentUserLocation);
            }
            else if (localStorage.getItem("weatherLocationQuery")) {
                currentUserLocation = localStorage.getItem("weatherLocationQuery");
                debugLog("Using cached lat,lon query:", currentUserLocation);
            }
            else if (locationData && locationData.name) {
                currentUserLocation = locationData.name;
                debugLog("Using structured location name:", currentUserLocation);
            }
            else {
                // Fallback IP lookup
                debugLog("Falling back to IP lookup");
                const ipInfo = "https://ipinfo.io/json/";
                const locationResponse = await fetch(ipInfo);
                
                if (!locationResponse.ok) {
                    console.error("Fallback IP lookup failed - HTTP", locationResponse.status, locationResponse.statusText);
                    throw new Error("Fallback IP location failed");
                }
                
                const ipLocation = await locationResponse.json();
                currentUserLocation = ipLocation.loc;
                debugLog("Fallback IP location:", currentUserLocation);
            }

            debugLog("Resolved location:", currentUserLocation);
            fetchWeather();
        } catch (error) {
            console.error("Location resolution failed:", error);
            // Fallback to Bangalore if all else fails
            currentUserLocation = "Bangalore";
            debugLog("Using Bangalore fallback");
            fetchWeather();
        }
    })();

    // Fetch weather data based on resolved location (20min cache)
    async function fetchWeather() {
        try {
            debugLog("fetchWeather() called with location:", currentUserLocation);

            let parsedData = JSON.parse(localStorage.getItem("weatherParsedData"));
            const weatherParsedTime = parseInt(localStorage.getItem("weatherParsedTime"));
            const weatherParsedLocation = localStorage.getItem("weatherParsedLocation");
            const weatherParsedLang = localStorage.getItem("weatherParsedLang");

            // Cache retention: 20 minutes
            const retentionTime = 20 * 60 * 1000;
            const cacheValid = parsedData && 
                              (Date.now() - weatherParsedTime) <= retentionTime &&
                              weatherParsedLocation === currentUserLocation &&
                              weatherParsedLang === currentLanguage;

            if (!cacheValid) {
                debugLog("Cache invalid/missing - fetching fresh data (cache age:", 
                        parsedData ? `${(Date.now() - weatherParsedTime)/1000}s` : "none", ")");
                
                // Clear cache when location changes
                if (weatherParsedLocation !== currentUserLocation) {
                    debugLog("Location changed - clearing cache");
                    localStorage.removeItem("weatherParsedData");
                    localStorage.removeItem("weatherParsedTime");
                    localStorage.removeItem("weatherParsedLocation");
                }

                // Language code for Weather API
                let lang = currentLanguage === "zh_TW" ? currentLanguage : currentLanguage.split("_")[0];

                // Primary: WeatherAPI fetch
                let weatherApi = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${currentUserLocation}&days=1&aqi=no&alerts=no&lang=${lang}`;
                debugLog("WeatherAPI URL:", weatherApi);

                let data = await fetch(weatherApi);
                parsedData = await data.json();
                debugLog("WeatherAPI Response status:", data.status, "data keys:", Object.keys(parsedData));

                if (parsedData.error) {
                    console.error("WeatherAPI Error:", parsedData.error);
                    document.getElementById("conditionText").textContent =
                        translations[currentLanguage]?.weatherError || "Weather unavailable";
                    document.getElementById("temp").textContent = "--";
                    document.getElementById("humidityLevel").textContent =
                        translations[currentLanguage]?.humidityLevel || translations["en"].humidityLevel;
                    return;
                }

                // Filter and prepare data structure
                const filteredData = {
                    location: {
                        name: parsedData.location.name,
                        lat: parsedData.location.lat,
                        lon: parsedData.location.lon,
                    },
                    current: {
                        condition: {
                            text: parsedData.current.condition.text,
                            icon: parsedData.current.condition.icon,
                        },
                        temp_c: parsedData.current.temp_c,
                        temp_f: parsedData.current.temp_f,
                        humidity: parsedData.current.humidity,
                        humiditySource: "weatherapi", // Default source
                        feelslike_c: parsedData.current.feelslike_c,
                        feelslike_f: parsedData.current.feelslike_f,
                    },
                    forecast: {
                        forecastday: [{
                            day: {
                                mintemp_c: parsedData.forecast.forecastday[0].day.mintemp_c,
                                maxtemp_c: parsedData.forecast.forecastday[0].day.maxtemp_c,
                                mintemp_f: parsedData.forecast.forecastday[0].day.mintemp_f,
                                maxtemp_f: parsedData.forecast.forecastday[0].day.maxtemp_f
                            }
                        }]
                    }
                };

                // Augment humidity with Open-Meteo (WeatherAPI condition text preserved)
                try {
                    const lat = filteredData.location.lat;
                    const lon = filteredData.location.lon;
                    debugLog("Augmenting humidity with Open-Meteo (lat:", lat, "lon:", lon, ")");

                    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=relative_humidity_2m`;
                    const openMeteoResponse = await fetch(openMeteoUrl);
                    const openMeteoData = await openMeteoResponse.json();

                    debugLog("Open-Meteo humidity response:", openMeteoData.current?.relative_humidity_2m);

                    if (openMeteoData.current && typeof openMeteoData.current.relative_humidity_2m === "number") {
                        filteredData.current.humidity = openMeteoData.current.relative_humidity_2m;
                        filteredData.current.humiditySource = "open-meteo";
                        debugLog("Humidity updated from Open-Meteo:", filteredData.current.humidity);
                    } else {
                        debugLog("Open-Meteo humidity invalid, keeping WeatherAPI value");
                    }
                } catch (error) {
                    console.error("Open-Meteo augmentation failed, using WeatherAPI humidity:", error);
                }

                // Persist filtered data (20min TTL)
                localStorage.setItem("weatherParsedData", JSON.stringify(filteredData));
                localStorage.setItem("weatherParsedTime", Date.now());
                localStorage.setItem("weatherParsedLocation", currentUserLocation);
                localStorage.setItem("weatherParsedLang", currentLanguage);
                debugLog("Weather data cached (TTL: 20min):", filteredData);
            } else {
                debugLog("Using cached weather data");
            }

            // Update UI from latest cached data
            parsedData = JSON.parse(localStorage.getItem("weatherParsedData"));
            UpdateWeather();

        } catch (error) {
            console.error("fetchWeather() error:", error);
            document.getElementById("conditionText").textContent =
                translations[currentLanguage]?.weatherError || "Weather unavailable";
        }
    }

    function UpdateWeather() {
        const parsedData = JSON.parse(localStorage.getItem("weatherParsedData"));
        const conditionText = parsedData.current.condition.text;
        const tempCelsius = Math.round(parsedData.current.temp_c);
        const tempFahrenheit = Math.round(parsedData.current.temp_f);
        const humidity = parsedData.current.humidity;
        const humiditySource = parsedData.current.humiditySource;
        const feelsLikeCelsius = parsedData.current.feelslike_c;
        const feelsLikeFahrenheit = parsedData.current.feelslike_f;

        debugLog("UpdateWeather() - Temp:", tempCelsius, "°C /", tempFahrenheit, "°F | Humidity:", humidity, "% (", humiditySource, ")");

        // Update DOM elements
        document.getElementById("conditionText").textContent = conditionText;

        // Localize numbers
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

        // Humidity display
        const humidityLabel = translations[currentLanguage]?.humidityLevel || translations["en"].humidityLevel;
        document.getElementById("humidityLevel").textContent = isRTL
            ? `${humidityLabel} %${localizedHumidity}`
            : `${humidityLabel} ${localizedHumidity}%`;

        // Temperature display logic
        const fahrenheitCheckbox = document.getElementById("fahrenheitCheckbox");
        const updateTemperatureDisplay = () => {
            const tempElement = document.getElementById("temp");
            const feelsLikeElement = document.getElementById("feelsLike");
            const feelsLikeLabel = translations[currentLanguage]?.feelsLike || translations["en"].feelsLike;

            const langWithSpaceBeforeDegree = ["cs"];
            const rangeSeparator = {
                cs: "až",
                default: "~"
            };
            const separator = rangeSeparator[currentLanguage] || rangeSeparator.default;

            if (fahrenheitCheckbox.checked) {
                tempElement.textContent = localizedTempFahrenheit;
                const tempUnitF = document.createElement("span");
                tempUnitF.className = "tempUnit";
                tempUnitF.textContent = "°F";
                tempElement.appendChild(tempUnitF);

                const feelsLikeFUnit = langWithSpaceBeforeDegree.includes(currentLanguage) ? " °F" : "°F";
                if (isMinMaxEnabled) {
                    feelsLikeElement.textContent = `${localizedMinTempF} ${separator} ${localizedMaxTempF}${feelsLikeFUnit}`;
                } else {
                    feelsLikeElement.textContent = isRTL
                        ? `${localizedFeelsLikeFahrenheit}${feelsLikeFUnit} ${feelsLikeLabel}`
                        : `${feelsLikeLabel} ${localizedFeelsLikeFahrenheit}${feelsLikeFUnit}`;
                }
            } else {
                tempElement.textContent = localizedTempCelsius;
                const tempUnitC = document.createElement("span");
                tempUnitC.className = "tempUnit";
                tempUnitC.textContent = "°C";
                tempElement.appendChild(tempUnitC);

                const feelsLikeCUnit = langWithSpaceBeforeDegree.includes(currentLanguage) ? " °C" : "°C";
                if (isMinMaxEnabled) {
                    feelsLikeElement.textContent = `${localizedMinTempC} ${separator} ${localizedMaxTempC}${feelsLikeCUnit}`;
                } else {
                    feelsLikeElement.textContent = isRTL
                        ? `${localizedFeelsLikeCelsius}${feelsLikeCUnit} ${feelsLikeLabel}`
                        : `${feelsLikeLabel} ${localizedFeelsLikeCelsius}${feelsLikeCUnit}`;
                }
            }
        };
        updateTemperatureDisplay();

        // Weather icon
        const newWIcon = parsedData.current.condition.icon;
        const weatherIcon = newWIcon.replace("//cdn.weatherapi.com/weather/64x64/", "https://cdn.weatherapi.com/weather/128x128/");
        const wIcon = document.getElementById("wIcon");
        wIcon.onerror = () => { wIcon.src = './svgs/defaultWeather.svg'; };
        wIcon.src = weatherIcon;

        // Humidity slider
        const humidityMinWidth = {
            idn: "47%", hu: "48%", de: "51%", ta: "46%", en: "42%"
        };
        const slider = document.getElementById("slider");
        slider.style.minWidth = humidityMinWidth[currentLanguage] || humidityMinWidth["en"];

        if (humidity > 40) {
            slider.style.width = `calc(${humidity}% - 60px)`;
        }

        // Location display with toggle
        let city = parsedData.location.name;
        let maxLength = 10;
        let isLocationHidden = localStorage.getItem("locationHidden") === "true";

        const locationTile = document.querySelector(".tiles.location");
        const locationIcon = locationTile.querySelector(".location-icon");
        const locationText = document.getElementById("location");

        function updateLocationText() {
            if (isLocationHidden) {
                locationText.textContent = translations[currentLanguage]?.location || translations.en.location;
            } else {
                const limitedText = city.length > maxLength ? city.slice(0, maxLength) + "..." : city;
                locationText.textContent = limitedText;
            }
        }

        updateLocationText();

        function getToggleIcon() {
            return isLocationHidden ? "./svgs/location-show.svg" : "./svgs/location-hide.svg";
        }

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

        locationIcon.addEventListener("click", (e) => {
            e.stopPropagation();
            isLocationHidden = !isLocationHidden;
            localStorage.setItem("locationHidden", isLocationHidden);
            updateLocationText();

            if (locationTile.matches(":hover")) {
                locationIcon.src = getToggleIcon();
            }
        });
    }
}

// Global checkbox state persistence
const hideWeatherCard = document.getElementById("hideWeatherCard");
const fahrenheitCheckbox = document.getElementById("fahrenheitCheckbox");

hideWeatherCard?.addEventListener("change", function () {
    saveCheckboxState("hideWeatherCardState", hideWeatherCard);
});

fahrenheitCheckbox?.addEventListener("change", function () {
    saveCheckboxState("fahrenheitCheckboxState", fahrenheitCheckbox);
});

loadCheckboxState("hideWeatherCardState", hideWeatherCard);
loadCheckboxState("fahrenheitCheckboxState", fahrenheitCheckbox);

// Min-max temp toggle
const minMaxTempCheckbox = document.getElementById("minMaxTempCheckbox");
minMaxTempCheckbox?.addEventListener("change", () => {
    const isChecked = minMaxTempCheckbox.checked;
    localStorage.setItem("minMaxTempEnabled", isChecked);
    window.location.reload();
});
