function initializeCalendar() {
  const calendarBody = document.getElementById('calendarBody');
  const calendarDayHeaders = document.getElementById('calendarDayHeaders');
  const monthYearDisplay = document.getElementById('calendarMonthYear');
  const prevButton = document.getElementById('prevMonth');
  const nextButton = document.getElementById('nextMonth');

  if (!calendarBody || !calendarDayHeaders || !monthYearDisplay || !prevButton || !nextButton) {
    return;
  }

  // Store current date being viewed
  let currentDate = new Date();
  const today = new Date(); // Store today's date for comparison

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthsOfYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Comprehensive holiday database
  // Format: { month: { day: "Holiday Name" } }
  const holidays = {
    // January
    0: {
      1: "New Year's Day"
    },
    // February
    1: {
      14: "Valentine's Day"
    },
    // March
    2: {
      17: "St. Patrick's Day"
    },
    // April
    3: {
      1: "April Fool's Day",
      22: "Earth Day"
    },
    // May
    4: {
      1: "Labour Day"
    },
    // June
    5: {
      12: "Independence Day (PH)" // Philippines
    },
    // July
    6: {
      4: "Independence Day (US)"
    },
    // October
    9: {
      31: "Halloween"
    },
    // November
    10: {
      1: "All Saints' Day",
      2: "All Souls' Day",
      30: "Bonifacio Day (PH)" // Philippines
    },
    // December
    11: {
      8: "Immaculate Conception",
      24: "Christmas Eve",
      25: "Christmas Day",
      30: "Rizal Day (PH)", // Philippines
      31: "New Year's Eve"
    }
  };

  // Function to check if a date is a holiday
  function isHoliday(month, day) {
    return holidays[month] && holidays[month][day];
  }

  // Function to calculate Easter (for movable holidays)
  function calculateEaster(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-indexed
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return { month, day };
  }

  // Function to get Good Friday (2 days before Easter)
  function getGoodFriday(year) {
    const easter = calculateEaster(year);
    const easterDate = new Date(year, easter.month, easter.day);
    const goodFriday = new Date(easterDate);
    goodFriday.setDate(easterDate.getDate() - 2);
    return { month: goodFriday.getMonth(), day: goodFriday.getDate() };
  }

  // Function to check if date is a movable holiday
  function isMovableHoliday(year, month, day) {
    const easter = calculateEaster(year);
    const goodFriday = getGoodFriday(year);
    
    // Check Easter Sunday
    if (month === easter.month && day === easter.day) {
      return "Easter Sunday";
    }
    
    // Check Good Friday
    if (month === goodFriday.month && day === goodFriday.day) {
      return "Good Friday";
    }
    
    return null;
  }

  function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Set header
    monthYearDisplay.textContent = `${monthsOfYear[month]} ${year}`;

    // Create day headers with weekend class for Sunday (0) and Saturday (6)
    calendarDayHeaders.innerHTML = '';
    daysOfWeek.forEach((day, index) => {
      const th = document.createElement('th');
      th.textContent = day.substring(0, 3); // Show first 3 letters
      
      // Add weekend class to Sunday (0) and Saturday (6)
      if (index === 0 || index === 6) {
        th.classList.add('weekend');
      }
      
      calendarDayHeaders.appendChild(th);
    });

    // Get calendar data
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const firstDayOfWeek = firstDayOfMonth.getDay();

    // Clear calendar body
    calendarBody.innerHTML = '';

    // Calculate total cells needed
    const totalCells = firstDayOfWeek + daysInMonth;
    const rows = Math.ceil(totalCells / 7);

    let dayCounter = 1;

    // Check if we're viewing the current month
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    const currentDay = today.getDate();

    // Create rows
    for (let i = 0; i < rows; i++) {
      const row = document.createElement('tr');
      
      // Create cells for each day of the week
      for (let j = 0; j < 7; j++) {
        const cell = document.createElement('td');
        const cellIndex = i * 7 + j;
        
        // Check if this cell should have a day number
        if (cellIndex < firstDayOfWeek || dayCounter > daysInMonth) {
          cell.classList.add('empty');
        } else {
          cell.textContent = dayCounter;
          
          // Check if this day is a holiday
          const fixedHoliday = isHoliday(month, dayCounter);
          const movableHoliday = isMovableHoliday(year, month, dayCounter);
          const holidayName = fixedHoliday || movableHoliday;
          
          if (holidayName) {
            cell.classList.add('holiday');
            cell.title = holidayName; // Show holiday name on hover
          }
          
          // Highlight today only if we're viewing the current month
          if (isCurrentMonth && dayCounter === currentDay) {
            cell.classList.add('today');
          }
          
          // Add weekend class to Sundays (j === 0) and Saturdays (j === 6)
          if (j === 0 || j === 6) {
            cell.classList.add('weekend');
          }
          
          dayCounter++;
        }
        
        row.appendChild(cell);
      }
      
      calendarBody.appendChild(row);
    }
  }

  // Event listeners for navigation buttons
  prevButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

  nextButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  // Initial render
  renderCalendar();
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCalendar);
} else {
  initializeCalendar();
}