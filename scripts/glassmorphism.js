/*
 * Glassmorphism feature
 * Adds optional backdrop blur and supports a toggle + blur intensity slider
 */

/* =======================
   DOM ELEMENTS
======================= */

const glassCheckbox = document.getElementById("glassCheckbox");
const glassBlurControl = document.getElementById("glassBlurControl");
const glassBar = document.querySelector("#glassBlurControl .opacityBar");
const glassSlider = document.getElementById("glassSlider");
const glassBlurLevel = document.getElementById("glassBlurLevel");

/* =======================
   CONFIG
======================= */

const MAX_BLUR =
	parseInt(
		getComputedStyle(document.documentElement)
			.getPropertyValue("--glass-max-blur")
	) || 30;

/* =======================
   CORE FUNCTIONS
======================= */

function setGlassBlur(px) {
	if (!glassSlider || !glassBlurLevel) return;

	const clamped = Math.max(0, Math.min(MAX_BLUR, Math.round(px)));
	const percent = (clamped / MAX_BLUR) * 100;

	glassSlider.style.width = `${percent}%`;
	glassBlurLevel.textContent = `${clamped}px`;

	document.documentElement.style.setProperty(
		"--glass-blur",
		`${clamped}px`
	);

	localStorage.setItem("glassBlur", clamped);
}

function setGlassEnabled(enabled) {
	if (enabled) {
		document.documentElement.classList.add("glass-enabled");
		localStorage.setItem("glassEnabled", "1");

		if (glassBlurControl) glassBlurControl.classList.remove("disabled");
		if (glassSlider) glassSlider.setAttribute("aria-disabled", "false");
		if (glassCheckbox) glassCheckbox.setAttribute("aria-checked", "true");
	} else {
		document.documentElement.classList.remove("glass-enabled");
		localStorage.setItem("glassEnabled", "0");

		if (glassBlurControl) glassBlurControl.classList.add("disabled");
		if (glassSlider) glassSlider.setAttribute("aria-disabled", "true");
		if (glassCheckbox) glassCheckbox.setAttribute("aria-checked", "false");
	}
}

/* =======================
   SLIDER DRAG HANDLING
======================= */

function handleGlassDrag(e) {
	if (!glassBar) return;

	const clientX = e.type.startsWith("touch")
		? e.touches[0].clientX
		: e.clientX;

	const rect = glassBar.getBoundingClientRect();
	let newPos = clientX - rect.left;

	newPos = Math.max(0, Math.min(rect.width, newPos));

	const percentage = (newPos / rect.width) * 100;
	const px = (percentage / 100) * MAX_BLUR;

	setGlassBlur(px);
}

function startGlassDrag() {
	const onMove = e => handleGlassDrag(e);
	const onEnd = () => {
		document.removeEventListener("mousemove", onMove);
		document.removeEventListener("touchmove", onMove);
		document.removeEventListener("mouseup", onEnd);
		document.removeEventListener("touchend", onEnd);
	};

	document.addEventListener("mousemove", onMove);
	document.addEventListener("touchmove", onMove);
	document.addEventListener("mouseup", onEnd);
	document.addEventListener("touchend", onEnd);
}

/* =======================
   EVENT LISTENERS
======================= */

if (glassBar) {
	["mousedown", "touchstart"].forEach(evt => {
		glassBar.addEventListener(
			evt,
			e => {
				e.preventDefault();
				handleGlassDrag(e);
				startGlassDrag();
			},
			{ passive: false }
		);
	});
}

if (glassCheckbox) {
	glassCheckbox.setAttribute("role", "switch");
	glassCheckbox.setAttribute("aria-label", "Toggle glassmorphism");

	glassCheckbox.addEventListener("change", () => {
		setGlassEnabled(glassCheckbox.checked);
	});
}

/* =======================
   INIT FROM STORAGE
======================= */

const savedGlassEnabled = localStorage.getItem("glassEnabled") === "1";
const savedGlassBlur = Number(localStorage.getItem("glassBlur")) || 8;

setGlassBlur(savedGlassBlur);
setGlassEnabled(savedGlassEnabled);

if (glassCheckbox) {
	glassCheckbox.checked = savedGlassEnabled;
}

/* =======================
   PUBLIC API
======================= */

window.glassmorphism = {
	setEnabled: setGlassEnabled,
	setBlur: setGlassBlur
};
