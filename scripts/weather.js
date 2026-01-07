/*
 * Material You NewTab
 * Copyright (c) 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

document.addEventListener("DOMContentLoaded", function () {
    const hideWeather = document.getElementById("hideWeather");
    const hideWeatherCheckbox = document.getElementById("hideWeatherCheckbox");

    // Select all elements that need to be disabled
    const elementsToDisable = document.querySelectorAll(".weather");

    // Retrieve saved state from localStorage (default: false if null)
    const savedState = localStorage.getItem("hideWeatherVisible") === "true";
    hideWeatherCheckbox.checked = savedState;

    function applyVisibilityState(isHidden) {
        hideWeather.classList.toggle("weather-hidden", isHidden);
    }

    // Function to toggle the 'inactive' class
    function toggleInactiveState(isInactive) {
        elementsToDisable.forEach(element => {
            element.classList.toggle("inactive", isInactive);
        });
    }

    // Apply initial state
    toggleInactiveState(savedState);
    applyVisibilityState(savedState);

    // Show weather widgets only if toggle is unchecked
    if (!savedState) {
        getWeatherData();
    }

    hideWeatherCheckbox.addEventListener("change", () => {
        const isChecked = hideWeatherCheckbox.checked;
        applyVisibilityState(isChecked);
        localStorage.setItem("hideWeatherVisible", isChecked);

        // Apply inactive class to disable elements visually
        toggleInactiveState(isChecked);

        if (!isChecked) {
            getWeatherData();
        }
    });
});

function normalizeHumidity(humidity, conditionText) {
    const c = conditionText.toLowerCase();

    if (
        (c.includes("clear") || c.includes("sunny")) &&
        humidity > 80
    ) {
        return Math.round((humidity + 70) / 2);
    }

    if (humidity > 95) return 95;
    if (humidity < 15) return 15;

    return humidity;
}

// WMO Weather interpretation codes
function interpretWeatherCode(code) {
    const weatherCodes = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Cloudy",
        45: "Foggy",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        71: "Slight snow",
        73: "Moderate snow",
        75: "Heavy snow",
        77: "Snow grains",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        85: "Slight snow showers",
        86: "Heavy snow showers",
        95: "Thunderstorm",
        96: "Thunderstorm with hail",
        99: "Thunderstorm with heavy hail"
    };

    return weatherCodes[code] || "Unknown";
}

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
    let savedLocation = localStorage.getItem("weatherLocation");
    const isPlainTextLocation = savedLocation && !savedLocation.includes(",");

    // Handle JSON location objects (parse if needed)
    if (savedLocation) {
        try {
            const parsed = JSON.parse(savedLocation);

            if (parsed.name) {
                // Show full name in input
                userLocInput.value = parsed.region
                    ? `${parsed.name}, ${parsed.region}, ${parsed.country}`
                    : `${parsed.name}, ${parsed.country}`;

                // ✅ KEEP CITY NAME ONLY (do NOT convert to lat,lon)
                savedLocation = parsed.name;
            }
        } catch (e) {
            // Plain text location like "Bangalore"
            userLocInput.value = savedLocation;
        }
    }
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

    // Handle GPS toggle change (actually uses IP-based location for extensions)
    gpsToggle.addEventListener("change", async () => {
        console.log("Location toggle clicked. Checked:", gpsToggle.checked);
        
        if (gpsToggle.checked) {
            console.log("Requesting IP-based location...");
            
            try {
                const location = await fetchIPBasedLocation();
                
                if (location) {
                    console.log("IP location obtained:", location);
                    localStorage.setItem("useGPS", true);
                    locationCont.classList.add("inactive");
                    console.log("Location enabled, reloading...");
                    location.reload();
                } else {
                    throw new Error("Could not fetch location");
                }
            } catch (error) {
                console.error("Location fetch failed:", error);
                gpsToggle.checked = false;
                alert("Could not fetch your location. Try manual entry.");
            }
        } else {
            console.log("Location disabled");
            localStorage.setItem("useGPS", false);
            locationCont.classList.remove("inactive");
            location.reload();
        }
    });

    // Handle manual location input
    saveLocButton.addEventListener("click", () => {
        const userLocation = userLocInput.value.trim();
        localStorage.setItem("weatherLocation", userLocation);
        localStorage.removeItem("weatherLocationQuery"); // Clear query cache to use the new location
        localStorage.removeItem("weatherParsedData"); // Clear cached weather data to force refresh
        localStorage.removeItem("weatherParsedTime");
        localStorage.removeItem("weatherParsedLocation");
        localStorage.setItem("useGPS", false);
        userLocInput.value = "";
        location.reload();
    });

    // Default Weather API key
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
            const response = await fetch(`https://api.weatherapi.com/v1/search.json?key=${savedApiKey}&q=${query}`);
            suggestions = await response.json();

            if (suggestions.length > 0) {
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

        locationSuggestions.style.display = "none";
        // Store the full object and the lat,lon query separately
        localStorage.setItem("weatherLocation", JSON.stringify(selectedLocation));
        localStorage.setItem("weatherLocationQuery", `${selectedLocation.lat},${selectedLocation.lon}`);
        saveLocButton.click();
        suggestions = [];
        toggleAutocomplete();
    }

    // Handle user input (fetch locations on change)
    userLocInput.addEventListener("input", () => {
        fetchLocationSuggestions(userLocInput.value)
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
    if (useGPS) locationCont.classList.add("inactive");


    // Function to fetch location via IP geolocation (works in extensions)
    async function fetchIPBasedLocation() {
        try {
            const response = await fetch("https://ipinfo.io/json/");
            const data = await response.json();
            return data.loc; // Returns "lat,lon"
        } catch (error) {
            console.error("IP geolocation failed:", error);
            return null;
        }
    }

    // Fetch location based on user preference
    await (async function initializeLocation() {
        try {
            if (useGPS) {
                currentUserLocation = await fetchIPBasedLocation();

                if (!currentUserLocation) {
                    throw new Error("IP location failed");
                }

                // IP location must dominate
                localStorage.removeItem("weatherLocation");
                localStorage.removeItem("weatherLocationQuery");
            }
            else if (isPlainTextLocation) {
                // Plain text location (manual input like "Bangalore") — always clear old query cache
                localStorage.removeItem("weatherLocationQuery");
                currentUserLocation = savedLocation;
            }
            else if (localStorage.getItem("weatherLocationQuery")) {
                currentUserLocation = localStorage.getItem("weatherLocationQuery");
            }
            else if (savedLocation) {
                currentUserLocation = savedLocation;
            }
            else {
                const ipInfo = "https://ipinfo.io/json/";
                const locationData = await fetch(ipInfo);
                const ipLocation = await locationData.json();
                currentUserLocation = ipLocation.loc;
            }

            // FORCE refresh when location changes
            localStorage.removeItem("weatherParsedData");
            localStorage.removeItem("weatherParsedTime");
            localStorage.removeItem("weatherParsedLocation");

            fetchWeather();
        } catch (error) {
            console.error("Location resolution failed:", error);
            // Fallback to Bangalore if all else fails
            currentUserLocation = "Bangalore";
            fetchWeather();
        }
    })();

    // Fetch weather data based on a location
    async function fetchWeather() {
        try {
            console.log("fetchWeather() called. currentUserLocation:", currentUserLocation);
            
            let parsedData = JSON.parse(localStorage.getItem("weatherParsedData"));
            const weatherParsedTime = parseInt(localStorage.getItem("weatherParsedTime"));
            const weatherParsedLocation = localStorage.getItem("weatherParsedLocation");
            const weatherParsedLang = localStorage.getItem("weatherParsedLang");

            const retentionTime = 5 * 60 * 1000; // 5 minutes 

            if (!parsedData ||
                ((Date.now() - weatherParsedTime) > retentionTime) ||
                (weatherParsedLocation !== currentUserLocation) ||
                (weatherParsedLang !== currentLanguage)) {

                console.log("Fetching fresh weather data...");

                // Language code for Weather API
                let lang = currentLanguage === "zh_TW" ? currentLanguage : currentLanguage.split("_")[0];

                // Fetch weather data using Weather API
                let weatherApi = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${currentUserLocation}&days=1&aqi=no&alerts=no&lang=${lang}`;

                console.log("WeatherAPI URL:", weatherApi);

                let data = await fetch(weatherApi);
                parsedData = await data.json();

                console.log("WeatherAPI Response:", parsedData);
                console.log("WeatherAPI Current Temp C:", parsedData.current?.temp_c);
                console.log("WeatherAPI Current Temp F:", parsedData.current?.temp_f);
                console.log("WeatherAPI Condition Text:", parsedData.current?.condition?.text);
                console.log("WeatherAPI Location:", parsedData.location?.name);

                if (parsedData.error) {
                    console.error("WeatherAPI Error:", parsedData.error);
                    return;
                }
                    // Extract only the necessary fields before saving
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
                            humiditySource: "weatherapi",
                            feelslike_c: parsedData.current.feelslike_c,
                            feelslike_f: parsedData.current.feelslike_f,
                        },
                        forecast: {
                            forecastday: [
                                {
                                    day: {
                                        mintemp_c: parsedData.forecast.forecastday[0].day.mintemp_c,
                                        maxtemp_c: parsedData.forecast.forecastday[0].day.maxtemp_c,
                                        mintemp_f: parsedData.forecast.forecastday[0].day.mintemp_f,
                                        maxtemp_f: parsedData.forecast.forecastday[0].day.maxtemp_f
                                    }
                                }
                            ]
                        }
                    };

                    try {
                        const lat = filteredData.location.lat;
                        const lon = filteredData.location.lon;

                        const openMeteoUrl =
                            `https://api.open-meteo.com/v1/forecast?` +
                            `latitude=${lat}&longitude=${lon}&` +
                            `current=relative_humidity_2m,weather_code`;

                        const openMeteoResponse = await fetch(openMeteoUrl);
                        const openMeteoData = await openMeteoResponse.json();

                        console.log("Open-Meteo Response:", openMeteoData);
                        console.log("Open-Meteo weather_code:", openMeteoData.current?.weather_code);
                        console.log("Open-Meteo humidity:", openMeteoData.current?.relative_humidity_2m);

                        if (openMeteoData.current) {
                            // Update humidity if available
                            if (typeof openMeteoData.current.relative_humidity_2m === "number") {
                                const rawHumidity = openMeteoData.current.relative_humidity_2m;

                                // ✅ Use Open-Meteo humidity directly (already accurate, no normalization needed)
                                filteredData.current.humidity = rawHumidity;
                                filteredData.current.humiditySource = "open-meteo";
                            }

                            // Don't override weather condition with Open-Meteo code
                            // WeatherAPI's condition text is more accurate for real-time weather
                            // Keep the WeatherAPI condition that was already set above
                        }
                    } catch (error) {
                        console.error("Open-Meteo data failed, using WeatherAPI values:", error);
                    }

                    // Save filtered weather data to localStorage
                    localStorage.setItem("weatherParsedData", JSON.stringify(filteredData));
                    localStorage.setItem("weatherParsedTime", Date.now()); // Save time of last fetching
                    localStorage.setItem("weatherParsedLocation", currentUserLocation); // Save user location
                    localStorage.setItem("weatherParsedLang", currentLanguage); // Save language preference
                    
                    console.log("Filtered Data saved to localStorage:", filteredData);
                    console.log("Saved Temp C:", filteredData.current.temp_c);
                    console.log("Saved Temp F:", filteredData.current.temp_f);
                }

            // ✅ Update parsedData with the latest filteredData (includes Open-Meteo humidity)
            parsedData = JSON.parse(localStorage.getItem("weatherParsedData"));

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

                console.log("UpdateWeather - Displaying:");
                console.log("Temp C from parsedData:", parsedData.current.temp_c, "-> Rounded:", tempCelsius);
                console.log("Temp F from parsedData:", parsedData.current.temp_f, "-> Rounded:", tempFahrenheit);
                console.log("Full parsedData.current:", parsedData.current);

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
            console.error("Error fetching weather data:", error);
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
