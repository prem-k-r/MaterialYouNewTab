/*
 * Material You New Tab
 * Copyright (c) 2024-2026 Prem, 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 */

class ThemeManager {
    constructor() {
        // Storage keys
        this.STORAGE_KEYS = {
            THEME: 'selectedTheme',
            CUSTOM_COLOR: 'customThemeColor',
            PREFERRED_MODE: 'preferredTheme',
            CUSTOM_VARIABLES: 'customColorVariables',
            LOADING_COLOR: 'LoadingScreenColor'
        };

        // Color variable definitions
        this.colorVariables = [
            { name: '--darkColor-blue', label: 'Primary Color', default: '#4382EC' },
            { name: '--darkerColor-blue', label: 'Secondary Color', default: '#3569B2' },
            { name: '--accentLightTint-blue', label: 'Accent Color', default: '#E2EEFF', id: 'accentColorPicker' },
            { name: '--bg-color-blue', label: 'Background Color', default: '#BBD6FD' },
            { name: '--textColorDark-blue', label: 'Text Color', default: '#1B3041' },
            { name: '--whitishColor-blue', label: 'Surface Color', default: '#ffffff' }
        ];

        // Store original light theme values
        this.lightThemeValues = {};
        this.modalOriginalValues = {};

        // System theme detection
        this.systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

        // Initialize
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeThemeMode();
        this.loadStoredTheme();
        this.updateFaviconColor();
        this.saveLoadingColor();

        // Remove Loading Screen when the DOM and the theme has loaded
        document.getElementById("LoadingScreen").style.display = "none";

        // Stop blinking of some elements when the page is reloaded
        setTimeout(() => {
            document.documentElement.classList.add("theme-transition");
        }, 25);
    }

    setupEventListeners() {
        // Theme mode buttons
        document.querySelectorAll('.themeSegBtn').forEach(btn => {
            btn.addEventListener('click', () => this.setThemeMode(btn.dataset.theme));
        });

        // Color radio buttons
        document.querySelectorAll('.colorPlate').forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) this.applyPresetTheme(e.target.value);
            });
        });

        // Color picker
        const colorPicker = document.getElementById('colorPicker');
        if (colorPicker) {
            colorPicker.addEventListener('input', this.throttle((e) => {
                this.applyCustomColor(e.target.value);
            }, 30));
        }

        // Modal controls
        const colorEditor = document.getElementById('colorEditor');
        const closeModal = document.getElementById('closeModal');
        const saveColors = document.getElementById('saveColors');
        const resetColors = document.getElementById('resetColors');
        const colorModal = document.getElementById('colorModal');

        if (colorEditor) colorEditor.addEventListener('click', () => this.openModal());
        if (closeModal) closeModal.addEventListener('click', () => this.closeModal());
        if (saveColors) saveColors.addEventListener('click', () => this.saveCustomVariables());
        if (resetColors) resetColors.addEventListener('click', () => this.resetToOriginal());

        // Close modal on outside click
        if (colorModal) {
            colorModal.addEventListener('click', (e) => {
                if (e.target.id === 'colorModal') this.closeModal();
            });
        }

        // System theme change
        this.systemTheme.addEventListener('change', (e) => {
            this.handleThemeModeChange();
        });

        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && colorModal && colorModal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    initializeThemeMode() {
        // Migrate old checkbox users
        const oldCheckboxState = localStorage.getItem('enableDarkModeCheckboxState');
        if (oldCheckboxState === 'checked') {
            localStorage.setItem(this.STORAGE_KEYS.PREFERRED_MODE, 'dark');
            localStorage.removeItem('enableDarkModeCheckboxState');
        }

        const savedMode = localStorage.getItem(this.STORAGE_KEYS.PREFERRED_MODE) || 'light';
        this.setThemeMode(savedMode);
    }

    setThemeMode(mode) {
        localStorage.setItem(this.STORAGE_KEYS.PREFERRED_MODE, mode);
        const segment = document.getElementById('themeSegment');
        if (segment) {
            segment.dataset.active = mode;
            this.moveIndicator(mode);
        }

        this.handleThemeModeChange();
    }

    handleThemeModeChange() {
        const mode = localStorage.getItem(this.STORAGE_KEYS.PREFERRED_MODE) || 'light';
        const isSystemDark = this.systemTheme.matches;

        let shouldUseDark = false;
        if (mode === 'dark') {
            shouldUseDark = true;
        } else if (mode === 'system' && isSystemDark) {
            shouldUseDark = true;
        }

        // Update sysTheme attribute for CSS compatibility
        document.body.setAttribute('sysTheme', isSystemDark ? 'systemDark' : 'systemLight');

        // Apply dark mode transformation
        this.applyDarkModeTransformation(shouldUseDark);
    }

    applyDarkModeTransformation(isDark) {
        // Don't apply dark mode transformation to black theme
        const isBlackTheme = document.getElementById('blackTheme')?.checked;
        if (isBlackTheme) return;

        const root = document.documentElement;

        if (isDark) {
            // Store light theme values if not already stored
            if (Object.keys(this.lightThemeValues).length === 0) {
                this.colorVariables.forEach(v => {
                    const currentValue = root.style.getPropertyValue(v.name) ||
                        getComputedStyle(root).getPropertyValue(v.name).trim();
                    this.lightThemeValues[v.name] = currentValue || v.default;
                });
            }

            // Transform colors for dark mode
            const darkColors = this.generateDarkModeColors(this.lightThemeValues);
            Object.entries(darkColors).forEach(([key, value]) => {
                root.style.setProperty(key, value);
            });
        } else {
            // Restore light theme values
            if (Object.keys(this.lightThemeValues).length > 0) {
                Object.entries(this.lightThemeValues).forEach(([key, value]) => {
                    root.style.setProperty(key, value);
                });
            }
        }

        this.updateFaviconColor();
        this.saveLoadingColor();
    }

    generateDarkModeColors(lightColors) {
        const darkColors = {};

        // Primary: H → same, S → S × 0.9, L → L × 0.85
        const primary = lightColors['--darkColor-blue'];
        darkColors['--darkColor-blue'] = this.transformColorForDark(primary, {
            hueShift: 0,
            satMultiplier: 0.9,
            lightMultiplier: 0.85
        });

        // Secondary: H → same, S → S × 0.9, L → 100 − (L × 0.9)
        const secondary = lightColors['--darkerColor-blue'];
        darkColors['--darkerColor-blue'] = this.transformColorForDark(secondary, {
            hueShift: 0,
            satMultiplier: 0.9,
            lightInvert: true,
            lightMultiplier: 0.9
        });

        // Accent: H → same, S → S × 0.8, L → L × 0.2
        const accent = lightColors['--accentLightTint-blue'];
        darkColors['--accentLightTint-blue'] = this.transformColorForDark(accent, {
            hueShift: 0,
            satMultiplier: 0.8,
            lightMultiplier: 0.2
        });

        // Background: H → same, S → S × 0.6, L → clamp(L × 0.15, 8–12)
        const bg = lightColors['--bg-color-blue'];
        darkColors['--bg-color-blue'] = this.transformColorForDark(bg, {
            hueShift: 0,
            satMultiplier: 0.6,
            lightMultiplier: 0.15,
            lightClamp: [8, 12]
        });

        // Text: H → same, S → S × 0.85, L → 100 − (L × 0.6)
        const text = lightColors['--textColorDark-blue'];
        darkColors['--textColorDark-blue'] = this.transformColorForDark(text, {
            hueShift: 0,
            satMultiplier: 0.85,
            lightInvert: true,
            lightMultiplier: 0.6
        });

        // Surface color: elevated dark surface
        darkColors['--whitishColor-blue'] = '#1F1F1F';

        return darkColors;
    }

    transformColorForDark(hex, options) {
        if (!this.isValidHexColor(hex)) return hex;

        const {
            hueShift = 0,
            satMultiplier = 1,
            lightMultiplier = 1,
            lightInvert = false,
            lightClamp = null
        } = options;

        hex = hex.replace('#', '');

        // Handle transparency (alpha channel)
        let alpha = '';
        if (hex.length === 8) {
            alpha = hex.substring(6, 8);
            hex = hex.substring(0, 6);
        } else if (hex.length === 4) {
            alpha = hex.charAt(3) + hex.charAt(3);
            hex = hex.substring(0, 3);
        }

        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('');
        }

        // Convert to HSL
        let r = parseInt(hex.substring(0, 2), 16) / 255;
        let g = parseInt(hex.substring(2, 4), 16) / 255;
        let b = parseInt(hex.substring(4, 6), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        // Apply transformations
        // Hue shift (0-1 range, wraps around)
        h = (h + hueShift) % 1;
        if (h < 0) h += 1;

        // Saturation multiplier
        s = Math.min(1, s * satMultiplier);

        // Lightness transformation
        if (lightInvert) {
            // L → 100 − (L × multiplier)
            l = 1 - (l * lightMultiplier);
        } else {
            // L → L × multiplier
            l = l * lightMultiplier;
        }

        // Clamp lightness if specified (values are in percentage, convert to 0-1)
        if (lightClamp) {
            const [min, max] = lightClamp;
            l = Math.max(min / 100, Math.min(max / 100, l));
        }

        // Ensure values are in valid range
        l = Math.max(0, Math.min(1, l));

        // Convert back to RGB
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        let r2, g2, b2;
        if (s === 0) {
            r2 = g2 = b2 = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r2 = hue2rgb(p, q, h + 1 / 3);
            g2 = hue2rgb(p, q, h);
            b2 = hue2rgb(p, q, h - 1 / 3);
        }

        const toHex = (x) => {
            const hex = Math.round(x * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        return `#${toHex(r2)}${toHex(g2)}${toHex(b2)}${alpha}`.toUpperCase();
    }



    moveIndicator(mode) {
        const modeIndex = { light: 0, dark: 1, system: 2 };
        const ltrIndex = modeIndex[mode] || 0;
        const index = isRTL ? 2 - ltrIndex : ltrIndex;

        const indicator = document.querySelector('.themeIndicator');
        if (indicator) {
            indicator.style.transform = `translateX(${index * 100}%)`;
        }
    }

    loadStoredTheme() {
        // Priority: Custom Variables > Custom Color > Preset Theme
        const customVars = localStorage.getItem(this.STORAGE_KEYS.CUSTOM_VARIABLES);
        if (customVars) {
            try {
                this.applyCustomVariables(JSON.parse(customVars));
                this.uncheckAllRadios();
                return;
            } catch (e) {
                console.error('Failed to parse custom variables:', e);
            }
        }

        const customColor = localStorage.getItem(this.STORAGE_KEYS.CUSTOM_COLOR);
        if (customColor) {
            this.applyCustomColor(customColor);
            this.uncheckAllRadios();

            const colorPicker = document.getElementById('colorPicker');
            if (colorPicker) colorPicker.value = customColor;
            return;
        }

        const theme = localStorage.getItem(this.STORAGE_KEYS.THEME) || 'blue';
        this.applyPresetTheme(theme);
        const radio = document.querySelector(`.colorPlate[value="${theme}"]`);
        if (radio) radio.checked = true;
    }

    applyPresetTheme(color) {
        this.removeBlackThemeStyles();
        localStorage.setItem(this.STORAGE_KEYS.THEME, color);
        localStorage.removeItem(this.STORAGE_KEYS.CUSTOM_COLOR);
        localStorage.removeItem(this.STORAGE_KEYS.CUSTOM_VARIABLES);

        // Clear stored light theme values so they can be recalculated
        this.lightThemeValues = {};

        const root = document.documentElement;

        if (color === 'blue') {
            this.colorVariables.forEach(v => {
                root.style.setProperty(v.name, v.default);
            });
        } else {
            const prefix = color;
            this.colorVariables.forEach(v => {
                const sourceVar = v.name.replace('-blue', `-${prefix}`);
                const computedValue = getComputedStyle(root).getPropertyValue(sourceVar).trim();
                root.style.setProperty(v.name, computedValue || `var(${sourceVar})`);
            });
        }

        if (color === 'dark') {
            this.applyBlackThemeStyles();
        } else {
            // Apply dark mode transformation if needed
            this.handleThemeModeChange();
        }

        this.updateCustomColorBorder();
        this.updateFaviconColor();
        this.saveLoadingColor();
    }

    applyCustomColor(color) {
        this.removeBlackThemeStyles();
        localStorage.setItem(this.STORAGE_KEYS.CUSTOM_COLOR, color);
        localStorage.removeItem(this.STORAGE_KEYS.THEME);
        localStorage.removeItem(this.STORAGE_KEYS.CUSTOM_VARIABLES);

        // Clear stored light theme values
        this.lightThemeValues = {};

        const adjustedColor = this.isNearWhite(color) ? '#696969' : color;
        const root = document.documentElement;

        root.style.setProperty('--bg-color-blue', this.adjustColor(adjustedColor, 0.7, true));
        root.style.setProperty('--accentLightTint-blue', this.adjustColor(adjustedColor, 0.9, true));
        root.style.setProperty('--darkerColor-blue', this.adjustColor(adjustedColor, 0.3, false));
        root.style.setProperty('--darkColor-blue', adjustedColor);
        root.style.setProperty('--textColorDark-blue', this.adjustColor(adjustedColor, 0.8, false));
        root.style.setProperty('--whitishColor-blue', '#ffffff');

        // Apply dark mode transformation if needed
        this.handleThemeModeChange();

        this.uncheckAllRadios();
        this.updateCustomColorBorder();
        this.updateFaviconColor();
        this.saveLoadingColor();
    }

    applyCustomVariables(variables) {
        this.removeBlackThemeStyles();

        // Clear stored light theme values
        this.lightThemeValues = {};

        const root = document.documentElement;

        Object.entries(variables).forEach(([key, value]) => {
            if (this.isValidHexColor(value)) {
                root.style.setProperty(key, value);
            }
        });

        // Apply dark mode transformation if needed
        this.handleThemeModeChange();

        this.updateCustomColorBorder();
        this.updateFaviconColor();
        this.saveLoadingColor();
    }

    // Black theme
    applyBlackThemeStyles() {
        document.body.classList.add('black-theme');

        // Apply dark theme styles to specific elements
        const accentColor = '#212121';
        document.querySelectorAll('.accentColor').forEach(el => {
            el.style.fill = accentColor;
        });
    }

    removeBlackThemeStyles() {
        document.body.classList.remove('black-theme');

        // Reset accent color fills
        document.querySelectorAll('.accentColor').forEach(el => {
            el.style.fill = '';
        });
    }

    uncheckAllRadios() {
        document.querySelectorAll('.colorPlate').forEach(radio => {
            radio.checked = false;
        });
    }

    updateCustomColorBorder() {
        const colorPickerLabel = document.querySelector('.colorPickerBtn[for="colorPicker"]');
        const colorEditorBtn = document.querySelector('.colorPickerBtn.editor');

        if (!colorPickerLabel || !colorEditorBtn) return;

        const customColor = localStorage.getItem(this.STORAGE_KEYS.CUSTOM_COLOR);
        const customVars = localStorage.getItem(this.STORAGE_KEYS.CUSTOM_VARIABLES);

        colorPickerLabel.style.borderColor = '';
        colorEditorBtn.style.borderColor = '';

        if (customColor) {
            colorPickerLabel.style.borderColor = customColor;
            colorEditorBtn.style.borderColor = '';
        } else if (customVars) {
            const vars = JSON.parse(customVars);
            const primaryColor = vars['--darkColor-blue'] || '#4382EC';
            colorPickerLabel.style.borderColor = '';
            colorEditorBtn.style.borderColor = primaryColor;
        }
    }

    // Color utility functions
    isNearWhite(hex, threshold = 240) {
        hex = hex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return r > threshold && g > threshold && b > threshold;
    }

    adjustColor(hex, factor, lighten = true) {
        hex = hex.replace('#', '');

        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('');
        }

        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);

        if (lighten) {
            r = Math.floor(r + (255 - r) * factor);
            g = Math.floor(g + (255 - g) * factor);
            b = Math.floor(b + (255 - b) * factor);
        } else {
            r = Math.floor(r * (1 - factor));
            g = Math.floor(g * (1 - factor));
            b = Math.floor(b * (1 - factor));
        }

        return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;
    }

    isValidHexColor(hex) {
        // Allows: #RGB, #RRGGBB, #RGBA, #RRGGBBAA
        return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(hex);
    }

    updateFaviconColor() {
        const rootStyles = getComputedStyle(document.documentElement);
        const darkColor = rootStyles.getPropertyValue('--darkColor-blue').trim();

        if (!darkColor) return;

        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="${darkColor}" style="transform: scale(1.2); transform-origin: center;"
                    d="M10 19v-5h4v5c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-7h1.7c.46 0 .68-.57.33-.87L12.67 3.6c-.38-.34-.96-.34-1.34 0l-8.36 7.53c-.34.3-.13.87.33.87H5v7c0 .55.45 1 1 1h3c.55 0 1-.45 1-1" />
            </svg>
        `;

        const encodedSvg = 'data:image/svg+xml,' + encodeURIComponent(svg);
        const favicon = document.getElementById('favicon');

        if (favicon) {
            favicon.href = encodedSvg;
            favicon.setAttribute('type', 'image/svg+xml');
        }
    }

    saveLoadingColor() {
        const bgColor = getComputedStyle(document.body).getPropertyValue('background-color');
        if (bgColor) {
            localStorage.setItem(this.STORAGE_KEYS.LOADING_COLOR, bgColor);
        }
    }

    // Modal functions
    openModal() {
        closeMenuBar();

        const modal = document.getElementById('colorModal');
        const container = document.getElementById('colorVariables');

        if (!modal || !container) return;

        container.innerHTML = '';

        const root = document.documentElement;
        const computedStyle = getComputedStyle(root);

        // Store original values before opening modal
        this.modalOriginalValues = {};

        this.colorVariables.forEach(variable => {
            let currentValue = root.style.getPropertyValue(variable.name) ||
                computedStyle.getPropertyValue(variable.name).trim();

            if (!this.isValidHexColor(currentValue)) {
                currentValue = variable.default;
            }

            // Store the original value
            this.modalOriginalValues[variable.name] = currentValue;

            const div = document.createElement('div');
            div.className = 'colorVariable';
            div.innerHTML = `
                <label>${variable.label}</label>
                <div class="colorInput">
                    <input type="color" data-var="${variable.name}" ${variable.id ? `id="${variable.id}"` : ''}
                        value="${currentValue}" autocomplete="off">
                    <input type="text" data-var="${variable.name}" placeholder="#000000"
                        value="${currentValue.toUpperCase()}"
                        pattern="^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$">
                </div>
            `;
            container.appendChild(div);
        });

        this.setupModalInputSync(container);
        modal.classList.add('active');

        const firstInput = container.querySelector('input[type="text"]');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }

    setupModalInputSync(container) {
        const root = document.documentElement;

        // Color picker changes
        container.querySelectorAll('input[type="color"]').forEach(input => {
            input.addEventListener('input', (e) => {
                const textInput = container.querySelector(
                    `input[type="text"][data-var="${e.target.dataset.var}"]`
                );
                if (textInput) {
                    textInput.value = e.target.value.toUpperCase();
                }

                // Apply live preview
                root.style.setProperty(e.target.dataset.var, e.target.value);
                this.updateFaviconColor();
            });
        });

        // Text input changes
        container.querySelectorAll('input[type="text"]').forEach(input => {
            input.addEventListener('input', (e) => {
                const value = e.target.value.trim();
                if (this.isValidHexColor(value)) {
                    const colorInput = container.querySelector(
                        `input[type="color"][data-var="${e.target.dataset.var}"]`
                    );
                    if (colorInput) {
                        colorInput.value = value;
                    }
                    e.target.style.borderColor = '';

                    // Apply live preview
                    root.style.setProperty(e.target.dataset.var, value);
                    this.updateFaviconColor();
                } else {
                    e.target.style.borderColor = '#ec4343';
                }
            });

            input.addEventListener('blur', (e) => {
                let value = e.target.value.trim();
                if (!value.startsWith('#')) {
                    value = '#' + value;
                }
                if (this.isValidHexColor(value)) {
                    e.target.value = value.toUpperCase();
                    e.target.style.borderColor = '';
                }
            });
        });
    }

    closeModal() {
        const modal = document.getElementById('colorModal');
        if (modal) {
            modal.classList.remove('active');
        }

        // Only restore original values if modal is actually closing (not after save)
        if (Object.keys(this.modalOriginalValues).length > 0) {
            const root = document.documentElement;
            Object.entries(this.modalOriginalValues).forEach(([varName, originalValue]) => {
                root.style.setProperty(varName, originalValue);
            });
            this.updateFaviconColor();
        }

        // Clear stored original values
        this.modalOriginalValues = {};
    }

    saveCustomVariables() {
        const container = document.getElementById('colorVariables');
        if (!container) return;

        const variables = {};
        let hasInvalidInput = false;

        container.querySelectorAll('input[type="text"]').forEach(input => {
            const varName = input.dataset.var;
            const value = input.value.trim();

            if (this.isValidHexColor(value)) {
                variables[varName] = value.toUpperCase();
            } else {
                hasInvalidInput = true;
            }
        });

        if (hasInvalidInput) {
            alert('Please fix invalid color values. Valid formats:\n' +
                '• #RGB (e.g., #FFF)\n' +
                '• #RGBA (e.g., #FFF8)\n' +
                '• #RRGGBB (e.g., #FF5733)\n' +
                '• #RRGGBBAA (e.g., #FF573380)');
            return;
        }

        // Clear light theme values so they can be recalculated
        this.lightThemeValues = {};

        // Apply the variables immediately
        const root = document.documentElement;
        Object.entries(variables).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });

        // Save to localStorage
        localStorage.setItem(this.STORAGE_KEYS.CUSTOM_VARIABLES, JSON.stringify(variables));
        localStorage.removeItem(this.STORAGE_KEYS.THEME);
        localStorage.removeItem(this.STORAGE_KEYS.CUSTOM_COLOR);

        // Apply dark mode transformation if needed
        this.handleThemeModeChange();

        // Update other visual elements
        this.updateFaviconColor();
        this.saveLoadingColor();

        // Uncheck radio buttons
        this.uncheckAllRadios();

        // Update original values to current values (so closing modal won't revert)
        this.modalOriginalValues = { ...variables };

        // Close modal
        this.closeModal();
    }

    // Reset to the values that existed when modal was opened
    resetToOriginal() {
        const container = document.getElementById('colorVariables');
        if (!container) return;

        const root = document.documentElement;

        Object.entries(this.modalOriginalValues).forEach(([varName, originalValue]) => {
            const colorInput = container.querySelector(
                `input[type="color"][data-var="${varName}"]`
            );
            const textInput = container.querySelector(
                `input[type="text"][data-var="${varName}"]`
            );

            if (colorInput && textInput) {
                colorInput.value = originalValue;
                textInput.value = originalValue.toUpperCase();
                textInput.style.borderColor = '';
            }

            // Apply to live preview
            root.style.setProperty(varName, originalValue);
        });

        this.updateFaviconColor();
    }

    throttle = (func, limit) => {
        let lastFunc;
        let lastRan;
        return (...args) => {
            if (!lastRan) {
                func(...args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(() => {
                    if (Date.now() - lastRan >= limit) {
                        func(...args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    };
}

// Initialize when DOM is ready
window.themeManager = new ThemeManager();
