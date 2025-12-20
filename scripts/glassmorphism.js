/*
 * Glassmorphism feature
 * Adds optional backdrop blur and supports a toggle + blur intensity slider
 */

const glassCheckbox = document.getElementById("glassCheckbox");
const glassBar = document.querySelector("#glassBlurControl .opacityBar");
const glassSlider = document.getElementById("glassSlider");
const glassBlurLevel = document.getElementById("glassBlurLevel");

const MAX_BLUR = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--glass-max-blur')) || 30;

function setGlassBlur(px) {
    const clamped = Math.max(0, Math.min(MAX_BLUR, Math.round(px)));
    const percent = (clamped / MAX_BLUR) * 100;
    glassSlider.style.width = `${percent}%`;
    glassBlurLevel.textContent = `${clamped}px`;
    document.documentElement.style.setProperty('--glass-blur', `${clamped}px`);
    localStorage.setItem('glassBlur', clamped);
}

function setGlassEnabled(enabled) {
    const control = document.getElementById('glassBlurControl');
    if (enabled) {
        document.documentElement.classList.add('glass-enabled');
        localStorage.setItem('glassEnabled', '1');
        if (control) control.classList.remove('disabled');
        if (glassSlider) glassSlider.setAttribute('aria-disabled', 'false');
        if (glassCheckbox) glassCheckbox.setAttribute('aria-checked', 'true');
    } else {
        document.documentElement.classList.remove('glass-enabled');
        localStorage.setItem('glassEnabled', '0');
        if (control) control.classList.add('disabled');
        if (glassSlider) glassSlider.setAttribute('aria-disabled', 'true');
        if (glassCheckbox) glassCheckbox.setAttribute('aria-checked', 'false');
    }
}

// Drag / click handling (similar to other sliders in the project)
function handleGlassDrag(e) {
    const clientX = e.type.startsWith("touch") ? e.touches[0].clientX : e.clientX;
    const rect = glassBar.getBoundingClientRect();
    let newPos = clientX - rect.left;
    newPos = Math.max(0, Math.min(rect.width, newPos));
    const percentage = +((newPos / rect.width) * 100).toFixed(2);
    const px = (percentage / 100) * MAX_BLUR;
    setGlassBlur(px);
}

function startGlassDrag() {
    const onMove = e => handleGlassDrag(e);
    const onEnd = () => {
        ["mousemove", "touchmove"].forEach(evt => document.removeEventListener(evt, onMove));
        ["mouseup", "touchend"].forEach(evt => document.removeEventListener(evt, onEnd));
    };
    ["mousemove", "touchmove"].forEach(evt => document.addEventListener(evt, onMove));
    ["mouseup", "touchend"].forEach(evt => document.addEventListener(evt, onEnd));
}

["mousedown", "touchstart"].forEach(evt => {
    glassBar.addEventListener(evt, e => {
        e.preventDefault();
        handleGlassDrag(e);
        startGlassDrag();
    }, { passive: false });
});

// Initialize from saved state
const savedGlassEnabled = localStorage.getItem('glassEnabled') === '1';
const savedGlassBlur = Number(localStorage.getItem('glassBlur')) || 8;

setGlassBlur(savedGlassBlur);
setGlassEnabled(savedGlassEnabled);
if (glassCheckbox) glassCheckbox.checked = savedGlassEnabled;

// Wire up the checkbox
if (glassCheckbox) {
    glassCheckbox.setAttribute('role', 'switch');
    glassCheckbox.setAttribute('aria-label', 'Toggle glassmorphism');
    glassCheckbox.addEventListener('change', () => {
        setGlassEnabled(glassCheckbox.checked);
    });
}

// Initialize disabled state for the control if needed
const glassBlurControl = document.getElementById('glassBlurControl');
if (glassBlurControl) {
    // reflect current enabled state
    if (!savedGlassEnabled) glassBlurControl.classList.add('disabled');
}

// Expose a small API for other scripts if needed
window.glassmorphism = {
    setEnabled: setGlassEnabled,
    setBlur: setGlassBlur,
};
