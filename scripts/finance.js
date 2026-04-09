/*
 * Material You NewTab - Finance Widget (with Currency Conversion)
 */

document.addEventListener("DOMContentLoaded", function () {
    const dock = document.getElementById("financeDock");
    const ticker = document.getElementById("stockTicker");
    const input = document.getElementById("stockInput");
    const addBtn = document.getElementById("addStockBtn");
    const currencySelect = document.getElementById("currencySelector");

    const financeCheckbox = document.getElementById("financeCheckbox");
    const wrapToggle = document.getElementById("financeWrapToggle");
    const compactToggle = document.getElementById("financeCompactToggle");
    const valueToggle = document.getElementById("financeValueToggle");

    const CACHE_KEY = "financeParsedData";
    const TIME_KEY = "financeLastUpdate";
    const SYMBOLS_KEY = "watchedStocks";
    const RETENTION_MS = 15 * 60 * 1000;

    const proxyurl = localStorage.getItem("proxy") || "https://mynt-proxy.rhythmcorehq.com/proxy?url=";
    const exchangeRateCache = {}; // Prevents redundant API calls for the same currency pair

    let watchedSymbols = JSON.parse(localStorage.getItem(SYMBOLS_KEY)) || ["AAPL", "BTC-USD", "^GSPC"];
    let prefCurrency = localStorage.getItem("financeCurrency") || "original";

    async function getExchangeRate(from, to) {
        if (from === to || to === "original") return 1;
        const pair = `${from}${to}=X`;
        if (exchangeRateCache[pair]) return exchangeRateCache[pair];

        try {
            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${pair}?interval=1d&range=1d`;
            const response = await fetch(proxyurl + encodeURIComponent(url));
            const data = await response.json();
            const rate = data.chart.result[0].meta.regularMarketPrice;
            exchangeRateCache[pair] = rate;
            return rate;
        } catch (e) {
            return 1;
        }
    }

    async function fetchStockData(symbol) {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
        try {
            const response = await fetch(proxyurl + encodeURIComponent(url));
            const data = await response.json();
            const meta = data.chart.result[0].meta;

            const nativePrice = meta.regularMarketPrice;
            const nativePrevClose = meta.chartPreviousClose;
            const nativeCurrency = meta.currency;

            // Handle Currency Conversion
            const targetCurrency = prefCurrency === "original" ? nativeCurrency : prefCurrency;
            const rate = await getExchangeRate(nativeCurrency, targetCurrency);

            const convertedPrice = nativePrice * rate;
            const convertedChange = (nativePrice - nativePrevClose) * rate;
            const percentChange = ((nativePrice - nativePrevClose) / nativePrevClose) * 100;

            return {
                symbol: symbol,
                price: convertedPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}),
                changeVal: (convertedChange >= 0 ? "+" : "") + convertedChange.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}),
                percent: (percentChange >= 0 ? "+" : "") + percentChange.toFixed(2) + "%",
                isUp: convertedChange >= 0,
                displayCurrency: targetCurrency
            };
        } catch (e) { return null; }
    }

    async function refreshData(force = false) {
        if (!financeCheckbox.checked) {
            dock.style.display = "none";
            return;
        }

        const lastUpdate = localStorage.getItem(TIME_KEY);
        const cachedData = localStorage.getItem(CACHE_KEY);

        // If user changed currency, we MUST force a fresh fetch to do the math
        if (!force && lastUpdate && (Date.now() - lastUpdate < RETENTION_MS) && cachedData) {
            const parsed = JSON.parse(cachedData);
            // Check if cache matches current currency preference
            if (parsed.length > 0 && parsed[0].displayCurrency === (prefCurrency === "original" ? parsed[0].displayCurrency : prefCurrency)) {
                renderStocks(parsed);
                return;
            }
        }

        const results = await Promise.all(watchedSymbols.map(s => fetchStockData(s)));
        const validResults = results.filter(r => r !== null);

        localStorage.setItem(CACHE_KEY, JSON.stringify(validResults));
        localStorage.setItem(TIME_KEY, Date.now().toString());
        renderStocks(validResults);
    }

    function renderStocks(data) {
        ticker.innerHTML = "";
        dock.style.display = "flex";

        if (localStorage.getItem("financeWrap") === "true") ticker.classList.add("wrap-mode");
        else ticker.classList.remove("wrap-mode");

        const isCompact = localStorage.getItem("financeCompact") === "true";
        const showValue = localStorage.getItem("financeShowValue") === "true";

        data.forEach(stock => {
            const pill = document.createElement("div");
            pill.className = `stock-pill ${isCompact ? 'compact' : ''}`;
            const trendDisplay = showValue ? stock.changeVal : stock.percent;

            pill.innerHTML = `
                <span class="sym">${stock.symbol}</span>
                ${isCompact ? '' : `<span class="price">${stock.price} <small>${stock.displayCurrency}</small></span>`}
                <span class="change ${stock.isUp ? 'up' : 'down'}">${stock.isUp ? '▲' : '▼'} ${trendDisplay}</span>
            `;

            pill.oncontextmenu = (e) => {
                e.preventDefault();
                watchedSymbols = watchedSymbols.filter(s => s !== stock.symbol);
                localStorage.setItem(SYMBOLS_KEY, JSON.stringify(watchedSymbols));
                refreshData(true);
            };

            ticker.appendChild(pill);
        });
    }

    addBtn.onclick = () => {
        const sym = input.value.toUpperCase().trim();
        if (sym && !watchedSymbols.includes(sym)) {
            watchedSymbols.push(sym);
            localStorage.setItem(SYMBOLS_KEY, JSON.stringify(watchedSymbols));
            input.value = "";
            refreshData(true);
        }
    };

    input.onkeydown = (e) => { if (e.key === "Enter") addBtn.click(); };

    financeCheckbox.onchange = () => {
        localStorage.setItem("financeCheckboxState", financeCheckbox.checked);
        refreshData(true);
    };

    wrapToggle.onchange = () => {
        localStorage.setItem("financeWrap", wrapToggle.checked);
        refreshData();
    };

    compactToggle.onchange = () => {
        localStorage.setItem("financeCompact", compactToggle.checked);
        refreshData();
    };

    valueToggle.onchange = () => {
        localStorage.setItem("financeShowValue", valueToggle.checked);
        refreshData();
    };

    currencySelect.onchange = () => {
        localStorage.setItem("financeCurrency", currencySelect.value);
        prefCurrency = currencySelect.value;
        refreshData(true); // Force refresh to trigger math conversion
    };

    // Load initial states
    financeCheckbox.checked = localStorage.getItem("financeCheckboxState") === "true";
    wrapToggle.checked = localStorage.getItem("financeWrap") === "true";
    compactToggle.checked = localStorage.getItem("financeCompact") === "true";
    valueToggle.checked = localStorage.getItem("financeShowValue") === "true";
    currencySelect.value = prefCurrency;

    refreshData();
});