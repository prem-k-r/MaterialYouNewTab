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