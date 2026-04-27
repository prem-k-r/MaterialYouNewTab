/*
 * Material You NewTab
 * Copyright (c) 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

// ----------------------------------- To Do List ----------------------------------------
// DOM Variables
const todoContainer = document.getElementById("todoContainer");
const todoListCont = document.getElementById("todoListCont");
const todoulList = document.getElementById("todoullist");
const todoAdd = document.getElementById("todoAdd");
const todoInput = document.getElementById("todoInput");
let todoList = {}; // Initialize todoList JSON
let suppressNextClick = false;
let suppressTimeout = null;

// Category and Priority translation keys (internal storage keys)
const categoryKeys = ["uncategorized", "work", "life", "study", "other"];
const priorityKeys = ["high", "medium", "low"];

// Mapping for backward compatibility with old Chinese data
const legacyCategoryMap = {
    "未分类": "uncategorized",
    "工作": "work",
    "生活": "life",
    "学习": "study",
    "其他": "other"
};

const legacyPriorityMap = {
    "高": "high",
    "中": "medium",
    "低": "low"
};

// Function to get translated text for todo items
function getTodoTranslation(key, fallback) {
    const savedLanguage = localStorage.getItem("selectedLanguage") || "en";
    return translations[savedLanguage]?.[key] || translations["en"]?.[key] || fallback;
}

// Function to get category display text by key
function getCategoryText(categoryKey) {
    const keyMap = {
        "uncategorized": "todoCategoryUncategorized",
        "work": "todoCategoryWork",
        "life": "todoCategoryLife",
        "study": "todoCategoryStudy",
        "other": "todoCategoryOther"
    };
    return getTodoTranslation(keyMap[categoryKey] || keyMap["uncategorized"], "Uncategorized");
}

// Function to get priority display text by key
function getPriorityText(priorityKey) {
    const keyMap = {
        "high": "todoPriorityHigh",
        "medium": "todoPriorityMedium",
        "low": "todoPriorityLow"
    };
    return getTodoTranslation(keyMap[priorityKey] || keyMap["medium"], "Medium");
}

// Function to get all categories for the current language
function getCategories() {
    return categoryKeys.map(key => ({
        key: key,
        text: getCategoryText(key)
    }));
}

// Function to get all priorities for the current language
function getPriorities() {
    return priorityKeys.map(key => ({
        key: key,
        text: getPriorityText(key)
    }));
}

// Function to migrate legacy data to new format
function migrateLegacyData(data) {
    if (!data) return {};
    const migrated = {};
    for (const id in data) {
        const item = data[id];
        migrated[id] = {
            ...item,
            category: legacyCategoryMap[item.category] || item.category || "uncategorized",
            priority: legacyPriorityMap[item.priority] || item.priority || "medium"
        };
    }
    return migrated;
}

// Add event listeners for Add button click or Enter key press
todoAdd.addEventListener("click", addtodoItem);
todoInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        addtodoItem();
    }
});

// Utility function to sanitize input
function sanitizeInput(input) {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
}

// Function to add items to the TODO list
function addtodoItem() {
    const inputText = todoInput.value.trim();
    if (inputText === "") return;

    const t = "t" + Date.now(); // Generate a Unique ID
    const rawText = inputText;
    
    const categorySelect = document.getElementById('todoCategory');
    const prioritySelect = document.getElementById('todoPriority');
    const dueDateInput = document.getElementById('todoDueDate');
    // Use translation keys instead of hardcoded text
    const category = categorySelect ? categorySelect.value : "uncategorized";
    const priority = prioritySelect ? prioritySelect.value : "medium";
    let dueDate = null;
    if (dueDateInput && dueDateInput.value) {
        // 处理时区问题，确保日期正确
        const date = new Date(dueDateInput.value);
        // 设置为UTC时间的当天开始，避免时区偏移
        date.setUTCHours(0, 0, 0, 0);
        dueDate = date.toISOString();
    }

    todoList[t] = { 
        title: rawText, 
        status: "pending", 
        pinned: false, 
        category: category, 
        priority: priority,
        createdAt: new Date().toISOString(),
        dueDate: dueDate
    }; // Add data to the JSON variable
    const li = createTodoItemDOM(t, rawText, "pending", false, category, priority, dueDate); // Create List item
    todoulList.appendChild(li); // Append the new item to the DOM immediately
    todoInput.value = ""; // Clear Input
    if (dueDateInput) dueDateInput.value = ""; // Clear due date input
    SaveToDoData(); // Save changes
}

function createTodoItemDOM(id, title, status, pinned, category, priority, dueDate) {
    let li = document.createElement("li");
    
    // Create task content container
    const taskContent = document.createElement("div");
    taskContent.className = "task-content";
    taskContent.innerHTML = sanitizeInput(title); // Sanitize before rendering in DOM
    
    // Create task metadata container
    const taskMeta = document.createElement("div");
    taskMeta.className = "task-meta";
    
    // Add category and priority with translated text
    const categoryBadge = document.createElement("span");
    categoryBadge.className = "category-badge";
    categoryBadge.textContent = getCategoryText(category);
    
    const priorityBadge = document.createElement("span");
    priorityBadge.className = `priority-badge priority-${priority}`;
    priorityBadge.textContent = getPriorityText(priority);
    
    taskMeta.appendChild(categoryBadge);
    taskMeta.appendChild(priorityBadge);
    
    // Add due date if exists
        if (dueDate) {
            const dueDateBadge = document.createElement("span");
            dueDateBadge.className = "due-date-badge";
            
            // Check if overdue
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);
            const due = new Date(dueDate);
            due.setUTCHours(0, 0, 0, 0);
            
            if (due < today) {
                dueDateBadge.classList.add("overdue");
            } else if (due.getTime() === today.getTime()) {
                dueDateBadge.classList.add("due-today");
            }
            
            // Format date to YYYY-MM-DD
            const formattedDate = due.toISOString().split('T')[0];
            dueDateBadge.textContent = formattedDate;
            taskMeta.appendChild(dueDateBadge);
        }
    
    li.appendChild(taskContent);
    li.appendChild(taskMeta);

    // Create and append edit button
    const editbtn = document.createElement("span");
    editbtn.setAttribute("class", "todoeditbtn");
    li.appendChild(editbtn);

    // Create and append remove button
    const removebtn = document.createElement("span");
    removebtn.setAttribute("class", "todoremovebtn");
    removebtn.textContent = "\u00d7";
    li.appendChild(removebtn);

    // Set base class and status
    li.setAttribute("class", "todolistitem");
    if (status === "completed") {
        li.classList.add("checked");
    }

    // Create and append pin button
    const pinbtn = document.createElement("span");
    pinbtn.setAttribute("class", "todopinbtn");
    li.appendChild(pinbtn);

    if (pinned) {
        li.classList.add("pinned");
    }

    li.setAttribute("data-todoitem", id); // Set a data attribute to the li so that we can uniquely identify which li has been modified or deleted
    return li; // Return the created `li` element
}

// Event delegation for task check and remove
todoulList.addEventListener("click", (event) => {
    if (event.target.tagName === "LI") {
        if (suppressNextClick) return;  // Prevent misclick on LI
        event.target.classList.toggle("checked"); // Check the clicked LI tag
        let id = event.target.dataset.todoitem;
        todoList[id].status = ((todoList[id].status === "completed") ? "pending" : "completed"); // Update status
        SaveToDoData(); // Save Changes
    }
    else if (event.target.classList.contains("todoremovebtn")) {
        let id = event.target.parentElement.dataset.todoitem;
        event.target.parentElement.remove(); // Remove the clicked LI tag
        delete todoList[id]; // Remove the deleted List item data
        SaveToDoData(); // Save Changes
    }
    else if (event.target.classList.contains("todopinbtn")) {
        event.target.parentElement.classList.toggle("pinned"); // Check the clicked LI tag
        let id = event.target.parentElement.dataset.todoitem;
        todoList[id].pinned = (todoList[id].pinned !== true); // Update status
        SaveToDoData(); // Save Changes
    }
    else if (event.target.classList.contains("todoeditbtn")) {
        if (suppressNextClick) return;

        const li = event.target.parentElement;
        const id = li.dataset.todoitem;
        const todo = todoList[id];
        const previousTitle = todo.title;
        // Use translation keys internally
        const previousCategory = todo.category || "uncategorized";
        const previousPriority = todo.priority || "medium";
        const previousDueDate = todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : "";

        li.classList.toggle("edit");
        if (li.classList.contains("edit")) {
            suppressNextClick = true; // prevent mis-clicks on next action

            // Find the task content and task meta elements
            const taskContent = li.querySelector(".task-content");
            const taskMeta = li.querySelector(".task-meta");

            //Safe check
            if (!taskContent) {
                console.warn("Task content element not found.");
                return;
            }

            const input = document.createElement("input");
            input.type = "text";
            input.className = "edit-input";
            input.value = previousTitle;
            
            // Create category select with translation keys
            const categorySelect = document.createElement("select");
            categorySelect.className = "todo-category-select";
            const categories = getCategories();
            categories.forEach(cat => {
                const option = document.createElement("option");
                option.value = cat.key;
                option.textContent = cat.text;
                if (cat.key === previousCategory) {
                    option.selected = true;
                }
                categorySelect.appendChild(option);
            });
            
            // Create priority select with translation keys
            const prioritySelect = document.createElement("select");
            prioritySelect.className = "todo-priority-select";
            const priorities = getPriorities();
            priorities.forEach(pri => {
                const option = document.createElement("option");
                option.value = pri.key;
                option.textContent = pri.text;
                if (pri.key === previousPriority) {
                    option.selected = true;
                }
                prioritySelect.appendChild(option);
            });
            
            // Create due date input
            const dueDateInput = document.createElement("input");
            dueDateInput.type = "date";
            dueDateInput.className = "todo-due-date-input";
            dueDateInput.value = previousDueDate;
            
            // Create edit controls container
            const editControls = document.createElement("div");
            editControls.className = "todo-edit-controls";
            editControls.appendChild(categorySelect);
            editControls.appendChild(prioritySelect);
            editControls.appendChild(dueDateInput);

            li.insertBefore(input, taskContent);
            li.insertBefore(editControls, taskContent);
            if (taskContent) li.removeChild(taskContent);
            if (taskMeta) li.removeChild(taskMeta);
            input.focus();

            // Save on blur or Enter
            function saveEdit() {
                const newTitle = input.value.trim();
                todo.title = (newTitle !== "") ? sanitizeInput(newTitle) : previousTitle;
                todo.category = categorySelect.value;
                todo.priority = prioritySelect.value;
                let dueDate = null;
                if (dueDateInput.value) {
                    // 处理时区问题，确保日期正确
                    const date = new Date(dueDateInput.value);
                    // 设置为UTC时间的当天开始，避免时区偏移
                    date.setUTCHours(0, 0, 0, 0);
                    dueDate = date.toISOString();
                }
                todo.dueDate = dueDate;
                
                // Recreate the task content and metadata
                const newTaskContent = document.createElement("div");
                newTaskContent.className = "task-content";
                newTaskContent.innerHTML = sanitizeInput(todo.title);
                
                const newTaskMeta = document.createElement("div");
                newTaskMeta.className = "task-meta";
                
                const categoryBadge = document.createElement("span");
                categoryBadge.className = "category-badge";
                categoryBadge.textContent = getCategoryText(todo.category);
                
                const priorityBadge = document.createElement("span");
                priorityBadge.className = `priority-badge priority-${todo.priority}`;
                priorityBadge.textContent = getPriorityText(todo.priority);
                
                newTaskMeta.appendChild(categoryBadge);
                newTaskMeta.appendChild(priorityBadge);
                
                // Add due date if exists
                if (todo.dueDate) {
                    const dueDateBadge = document.createElement("span");
                    dueDateBadge.className = "due-date-badge";
                    
                    // Check if overdue
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const due = new Date(todo.dueDate);
                    due.setHours(0, 0, 0, 0);
                    
                    if (due < today) {
                        dueDateBadge.classList.add("overdue");
                    } else if (due.toDateString() === today.toDateString()) {
                        dueDateBadge.classList.add("due-today");
                    }
                    
                    // Format date to YYYY-MM-DD
                    const formattedDate = due.toISOString().split('T')[0];
                    dueDateBadge.textContent = formattedDate;
                    newTaskMeta.appendChild(dueDateBadge);
                }
                
                li.insertBefore(newTaskContent, input);
                li.insertBefore(newTaskMeta, input);
                li.removeChild(input);
                li.removeChild(editControls);
                li.classList.remove("edit");
                SaveToDoData(); // Save changes

                // Delay resetting to allow click suppression
                clearTimeout(suppressTimeout);
                suppressTimeout = setTimeout(() => {
                    suppressNextClick = false;
                }, 500);
            }

            // Cancel function for escape key
            function cancelEdit() {
                // Remove the blur event to prevent saveEdit from running
                input.removeEventListener("blur", saveEdit);

                // Safe Check: Only remove input if it's still in the DOM
                if (li.contains(input)) {
                    // Recreate the task content and metadata
                    const newTaskContent = document.createElement("div");
                    newTaskContent.className = "task-content";
                    newTaskContent.innerHTML = sanitizeInput(previousTitle);
                    
                    const newTaskMeta = document.createElement("div");
                    newTaskMeta.className = "task-meta";
                    
                    const categoryBadge = document.createElement("span");
                    categoryBadge.className = "category-badge";
                    categoryBadge.textContent = getCategoryText(previousCategory);
                    
                    const priorityBadge = document.createElement("span");
                    priorityBadge.className = `priority-badge priority-${previousPriority}`;
                    priorityBadge.textContent = getPriorityText(previousPriority);
                    
                    newTaskMeta.appendChild(categoryBadge);
                    newTaskMeta.appendChild(priorityBadge);
                    
                    // Add due date if exists
                    if (todo.dueDate) {
                        const dueDateBadge = document.createElement("span");
                        dueDateBadge.className = "due-date-badge";
                        
                        // Check if overdue
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const due = new Date(todo.dueDate);
                        due.setHours(0, 0, 0, 0);
                        
                        if (due < today) {
                            dueDateBadge.classList.add("overdue");
                        } else if (due.toDateString() === today.toDateString()) {
                            dueDateBadge.classList.add("due-today");
                        }
                        
                        // Format date to YYYY-MM-DD
                        const formattedDate = due.toISOString().split('T')[0];
                        dueDateBadge.textContent = formattedDate;
                        newTaskMeta.appendChild(dueDateBadge);
                    }
                    
                    li.insertBefore(newTaskContent, input);
                    li.insertBefore(newTaskMeta, input);
                    li.removeChild(input);
                    li.removeChild(editControls);
                    li.classList.remove("edit");

                    clearTimeout(suppressTimeout);
                    suppressTimeout = setTimeout(() => {
                        suppressNextClick = false;
                    }, 200);
                }
            }

            input.addEventListener("blur", saveEdit);
            input.addEventListener("keydown", function (e) {
                if (e.key === "Enter") {
                    input.blur(); // triggers saveEdit
                } else if (e.key === "Escape") {
                    cancelEdit();
                }
            });
        }
    }
});

// Save JSON to storage
function SaveToDoData() {
    if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.set({ todoList: todoList });
    } else {
        localStorage.setItem("todoList", JSON.stringify(todoList));
    }
}

// Fetch saved JSON and create list items using it
function ShowToDoList() {
    try {
        if (typeof chrome !== "undefined" && chrome.storage) {
            chrome.storage.local.get("todoList", (result) => {
                let data = result.todoList || {};
                // Migrate legacy data if needed
                const needsMigration = Object.values(data).some(todo => 
                    legacyCategoryMap[todo.category] || legacyPriorityMap[todo.priority]
                );
                if (needsMigration) {
                    data = migrateLegacyData(data);
                    SaveToDoData();
                }
                todoList = data;
                renderTodoList();
            });
        } else {
            let data = JSON.parse(localStorage.getItem("todoList")) || {};
            // Migrate legacy data if needed
            const needsMigration = Object.values(data).some(todo => 
                legacyCategoryMap[todo.category] || legacyPriorityMap[todo.priority]
            );
            if (needsMigration) {
                data = migrateLegacyData(data);
                SaveToDoData();
            }
            todoList = data;
            renderTodoList();
        }
    } catch (error) {
        console.error("Error loading from storage:", error);
        if (typeof chrome !== "undefined" && chrome.storage) {
            chrome.storage.local.set({ todoList: {} });
        } else {
            localStorage.setItem("todoList", "{}"); // Reset corrupted data
        }
        renderTodoList();
    }
}

// Render todo list
function renderTodoList() {
    const fragment = document.createDocumentFragment(); // Create a DocumentFragment
    
    // Get filter and sort options
    const filterOption = document.getElementById('todoFilter')?.value || 'all';
    const sortOption = document.getElementById('todoSort')?.value || 'created';
    
    // Convert todoList object to array for filtering and sorting
    const todoArray = [];
    for (let id in todoList) {
        todoArray.push({ id, ...todoList[id] });
    }
    
    // Filter todos
    const filteredTodos = todoArray.filter(todo => {
        // Use translation keys internally
        const category = todo.category || "uncategorized";
        const priority = todo.priority || "medium";
        const dueDate = todo.dueDate;
        
        // Check filter condition
        if (filterOption === 'all') {
            return true;
        } else if (filterOption === 'pending') {
            return todo.status === 'pending';
        } else if (filterOption === 'completed') {
            return todo.status === 'completed';
        } else if (filterOption === 'overdue') {
            if (!dueDate) return false;
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);
            const due = new Date(dueDate);
            due.setUTCHours(0, 0, 0, 0);
            return due < today && todo.status === 'pending';
        } else if (filterOption === 'today') {
            if (!dueDate) return false;
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);
            const due = new Date(dueDate);
            due.setUTCHours(0, 0, 0, 0);
            return due.getTime() === today.getTime() && todo.status === 'pending';
        }
        return true;
    });
    
    // Sort todos
    filteredTodos.sort((a, b) => {
        if (sortOption === 'created') {
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        } else if (sortOption === 'priority') {
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            return (priorityOrder[b.priority || 'medium'] || 0) - (priorityOrder[a.priority || 'medium'] || 0);
        } else if (sortOption === 'due') {
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        }
        return 0;
    });
    
    // Create DOM elements for filtered and sorted todos
    filteredTodos.forEach(todo => {
        // Use translation keys internally
        const category = todo.category || "uncategorized";
        const priority = todo.priority || "medium";
        const dueDate = todo.dueDate;
        const li = createTodoItemDOM(todo.id, todo.title, todo.status, todo.pinned, category, priority, dueDate); // Create `li` elements
        fragment.appendChild(li); // Add `li` to the fragment
    });

    todoulList.appendChild(fragment); // Append all `li` to the `ul` at once
}

// Code to reset the List on the Next Day
function checkAndResetTodoList() {
    const todoCurrentDate = new Date().toLocaleDateString(); // Get current date
    
    if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.get("todoLastUpdateDate", (result) => {
            const todoLastUpdateDate = result.todoLastUpdateDate;
            handleTodoReset(todoLastUpdateDate, todoCurrentDate);
        });
    } else {
        const todoLastUpdateDate = localStorage.getItem("todoLastUpdateDate");
        handleTodoReset(todoLastUpdateDate, todoCurrentDate);
    }
}

function handleTodoReset(todoLastUpdateDate, todoCurrentDate) {
    if (todoLastUpdateDate === todoCurrentDate) {
        ShowToDoList();
    } else {
        // Modify the list when last update date and the current date does not match
        if (typeof chrome !== "undefined" && chrome.storage) {
            chrome.storage.local.set({ todoLastUpdateDate: todoCurrentDate });
            chrome.storage.local.get("todoList", (result) => {
                todoList = result.todoList || {};
                processTodoReset();
            });
        } else {
            localStorage.setItem("todoLastUpdateDate", todoCurrentDate);
            todoList = JSON.parse(localStorage.getItem("todoList")) || {};
            processTodoReset();
        }
    }
}

function processTodoReset() {
    for (let id in todoList) {
        if (todoList[id].pinned === false) {
            if (todoList[id].status === "completed") {
                delete todoList[id]; // Remove the Unpinned and Completed list item data
            }
        } else {
            todoList[id].status = "pending"; // Reset status of pinned items
        }
    }

    SaveToDoData();
    ShowToDoList();
}

// Check and reset todo list on page load
checkAndResetTodoList();

// Export todo data
function exportTodoData() {
    const dataStr = JSON.stringify(todoList, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `todo-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Import todo data
function importTodoData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    // Merge imported data with existing data
                    for (let id in importedData) {
                        // 确保导入的数据包含所有必要的字段，使用翻译键
                        const todo = importedData[id];
                        todoList[id] = {
                            title: todo.title || "",
                            status: todo.status || "pending",
                            pinned: todo.pinned || false,
                            category: todo.category || "uncategorized",
                            priority: todo.priority || "medium",
                            createdAt: todo.createdAt || new Date().toISOString(),
                            dueDate: todo.dueDate || null
                        };
                    }
                    SaveToDoData();
                    todoulList.innerHTML = '';
                    ShowToDoList();
                    alert(getTodoTranslation('todoImportSuccess', 'Import successful!'));
                } catch (error) {
                    alert(getTodoTranslation('todoImportFailed', 'Import failed: Invalid JSON file'));
                    console.error('Error importing todo data:', error);
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// Add event listeners for import/export buttons
document.addEventListener('DOMContentLoaded', function() {
    const todoImportBtn = document.getElementById('todoImport');
    const todoExportBtn = document.getElementById('todoExport');
    const todoFilter = document.getElementById('todoFilter');
    const todoSort = document.getElementById('todoSort');
    
    if (todoImportBtn) {
        todoImportBtn.addEventListener('click', importTodoData);
    }
    
    if (todoExportBtn) {
        todoExportBtn.addEventListener('click', exportTodoData);
    }
    
    if (todoFilter) {
        todoFilter.addEventListener('change', function() {
            todoulList.innerHTML = '';
            ShowToDoList();
        });
    }
    
    if (todoSort) {
        todoSort.addEventListener('change', function() {
            todoulList.innerHTML = '';
            ShowToDoList();
        });
    }
});

// Request notification permission
function requestNotificationPermission() {
    if ("Notification" in window) {
        Notification.requestPermission();
    }
}

// Check for due tasks and send notifications
function checkDueTasks() {
    if ("Notification" in window && Notification.permission === "granted") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let id in todoList) {
            const todo = todoList[id];
            if (todo.status === "pending" && todo.dueDate) {
                const due = new Date(todo.dueDate);
                due.setHours(0, 0, 0, 0);
                
                // Check if task is due today or overdue
                if (due <= today) {
                    const isOverdue = due < today;
                    const notificationTitle = getTodoTranslation('todoNotificationTitle', 'To Do Reminder');
                    const dueStatus = isOverdue 
                        ? getTodoTranslation('todoDueOverdue', 'Overdue')
                        : getTodoTranslation('todoDueToday', 'Due today');
                    new Notification(notificationTitle, {
                        body: `Task "${todo.title}" - ${dueStatus}`,
                        icon: "./favicon/icon48.png"
                    });
                }
            }
        }
    }
}

// Toggle menu and tooltip visibility
todoListCont.addEventListener("click", function (event) {
    const isMenuVisible = todoContainer.style.display === "grid";

    // Toggle menu visibility
    todoContainer.style.display = isMenuVisible ? "none" : "grid";

    // Add or remove the class to hide the tooltip
    if (!isMenuVisible) {
        todoContainer.style.animation = "panelScaleIn 200ms cubic-bezier(0.4, 0, 0.2, 1) forwards";
        todoListCont.classList.add("menu-open"); // Hide tooltip
        todoInput.focus(); // Auto focus on input box
        requestNotificationPermission(); // Request notification permission when opening todo list
    } else {
        //todoContainer.style.animation = "panelScaleOut 150ms cubic-bezier(0.4, 0, 1, 1) forwards";
        todoListCont.classList.remove("menu-open"); // Restore tooltip
    }
});

// Check for due tasks every hour
setInterval(checkDueTasks, 3600000);

// Check on page load
window.addEventListener("load", checkDueTasks);

// Close menu when clicking outside
document.addEventListener("click", function (event) {
    const isClickInside =
        todoContainer.contains(event.target) || todoListCont.contains(event.target) || event.target.classList.contains("todoremovebtn");

    if (!isClickInside && todoContainer.style.display === "grid") {
        todoContainer.style.display = "none"; // Hide menu
        todoListCont.classList.remove("menu-open"); // Restore tooltip
    }

    event.stopPropagation();
});

// ----------------------- To Do List Toggle -----------------------------
document.addEventListener("DOMContentLoaded", function () {
    const todoListCheckbox = document.getElementById("todoListCheckbox");

    todoListCheckbox.addEventListener("change", function () {
        saveCheckboxState("todoListCheckboxState", todoListCheckbox);
        if (todoListCheckbox.checked) {
            todoListCont.style.display = "flex";
            saveDisplayStatus("todoListDisplayStatus", "flex");
        } else {
            todoListCont.style.display = "none";
            saveDisplayStatus("todoListDisplayStatus", "none");
        }
    });

    loadCheckboxState("todoListCheckboxState", todoListCheckbox);
    loadDisplayStatus("todoListDisplayStatus", todoListCont);
});
