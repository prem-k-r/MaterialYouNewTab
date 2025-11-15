const card = document.getElementById("openCalendar");
const popup = document.getElementById("calendarPopup");
const closeBtn = document.getElementById("closeCalendar");
const calGrid = document.getElementById("calendarGrid");
const calMonthText = document.getElementById("calMonthText");
const monthSelect = document.getElementById("monthSelect");
const yearSelect = document.getElementById("yearSelect");
const prev = document.getElementById("prevMonth");
const next = document.getElementById("nextMonth");
const todayBtn = document.getElementById("todayBtn");
const calMonth = document.getElementById("calMonth");
const weekdaysContainer = document.querySelector(".calendar-weekdays");

let currentDate = new Date();
let selectedDay = null;

function createRipple(e) {
  const btn = e.currentTarget;
  const ripple = document.createElement("span");
  const diameter = Math.max(btn.clientWidth, btn.clientHeight);
  const radius = diameter / 2;
  ripple.style.width = ripple.style.height = `${diameter}px`;
  ripple.style.left = `${e.clientX - btn.getBoundingClientRect().left - radius}px`;
  ripple.style.top = `${e.clientY - btn.getBoundingClientRect().top - radius}px`;
  ripple.className = "ripple";
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

document.querySelectorAll(".ripple-btn").forEach(btn => btn.addEventListener("click", createRipple));

function updateCard() {
  const d = new Date();
  card.textContent = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
}
updateCard();

function populateSelects() {
  // Months
  const months = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('default', { month: 'long' }));
  months.forEach((month, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = month;
    monthSelect.appendChild(option);
  });
  // Years (current -10 to +10)
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 10; y <= currentYear + 10; y++) {
    const option = document.createElement("option");
    option.value = y;
    option.textContent = y;
    yearSelect.appendChild(option);
  }
}
populateSelects();

function buildWeekdays() {
  weekdaysContainer.innerHTML = "";
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(name => {
    const el = document.createElement("div");
    el.textContent = name;
    weekdaysContainer.appendChild(el);
  });
}
buildWeekdays();

function buildCalendar(date) {
  calGrid.innerHTML = "";
  const y = date.getFullYear();
  const m = date.getMonth();
  calMonthText.textContent = `${date.toLocaleString('default', { month: 'long' })} ${y}`;
  monthSelect.value = m;
  yearSelect.value = y;
  calMonth.style.opacity = 0;
  setTimeout(() => calMonth.style.opacity = 1, 150);

  const firstDay = new Date(y, m, 1).getDay();
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    calGrid.appendChild(empty);
  }

  const totalDays = new Date(y, m + 1, 0).getDate();
  const today = new Date();
  for (let d = 1; d <= totalDays; d++) {
    const el = document.createElement("div");
    el.textContent = d;
    el.className = "day";
    if ((firstDay + d - 1) % 7 === 0 || (firstDay + d - 1) % 7 === 6) {
      el.classList.add("weekend");
    }
    if (d === today.getDate() && m === today.getMonth() && y === today.getFullYear()) {
      el.classList.add("today");
    }
    if (selectedDay && selectedDay.y === y && selectedDay.m === m && selectedDay.d === d) {
      el.classList.add("selected");
    }
    el.addEventListener("click", () => {
      document.querySelectorAll(".selected").forEach(s => s.classList.remove("selected"));
      el.classList.add("selected");
      selectedDay = { y, m, d };
      // Creative: Add a subtle animation on select
      el.style.animation = "selectPulse 0.3s";
      setTimeout(() => el.style.animation = "", 300);
    });
    calGrid.appendChild(el);
  }
}

// Add keyframe for select pulse
const style = document.createElement("style");
style.textContent = `@keyframes selectPulse { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1.1); } }`;
document.head.appendChild(style);

card.onclick = () => {
  popup.style.display = "flex";
  buildCalendar(currentDate);
};

closeBtn.onclick = () => popup.style.display = "none";
popup.onclick = e => { if (e.target === popup) popup.style.display = "none"; };

prev.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  buildCalendar(currentDate);
};

next.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  buildCalendar(currentDate);
};

todayBtn.onclick = () => {
  currentDate = new Date();
  buildCalendar(currentDate);
};

// Month/Year selection interactivity
calMonth.onclick = () => {
  monthSelect.classList.toggle("hidden");
  yearSelect.classList.toggle("hidden");
  calMonthText.style.display = monthSelect.classList.contains("hidden") ? "inline" : "none";
};

monthSelect.onchange = () => {
  currentDate.setMonth(parseInt(monthSelect.value));
  buildCalendar(currentDate);
  calMonth.onclick();
};

yearSelect.onchange = () => {
  currentDate.setFullYear(parseInt(yearSelect.value));
  buildCalendar(currentDate);
  calMonth.onclick();
};

// Enhanced swipe with threshold and prevent default
let startX = 0;
let startY = 0;
calGrid.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
}, { passive: true });

calGrid.addEventListener("touchend", e => {
  const endX = e.changedTouches[0].clientX;
  const endY = e.changedTouches[0].clientY;
  const diffX = startX - endX;
  const diffY = startY - endY;
  if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
    if (diffX > 0) next.click();
    else prev.click();
  }
}, { passive: true });

// Keyboard navigation
popup.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") prev.click();
  if (e.key === "ArrowRight") next.click();
  if (e.key === "Escape") closeBtn.click();
  if (e.key === "Home") todayBtn.click();
});

// Creative: Add confetti on today's date click (using canvas for fun)
function confetti(el) {
  const canvas = document.createElement("canvas");
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.width = el.offsetWidth;
  canvas.height = el.offsetHeight;
  el.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const particles = [];
  for (let i = 0; i < 20; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4 - 2,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      size: Math.random() * 5 + 2
    });
  }
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // gravity
      p.size *= 0.98;
      if (p.size > 0.1) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    if (particles.some(p => p.size > 0.1)) requestAnimationFrame(animate);
    else canvas.remove();
  }
  animate();
}

// Attach to today click
calGrid.addEventListener("click", e => {
  if (e.target.classList.contains("today")) confetti(e.target);
});