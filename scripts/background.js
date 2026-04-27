// Background service worker for Material You New Tab

// Translations for background script
const bgTranslations = {
    en: {
        addTodo: "Add to To Do List",
        notificationTitle: "To Do Reminder",
        overdue: "Overdue",
        dueToday: "Due today"
    },
    zh: {
        addTodo: "添加为待办事项",
        notificationTitle: "待办事项提醒",
        overdue: "已逾期",
        dueToday: "今天到期"
    }
};

// Get current language from localStorage
function getBackgroundLanguage() {
    return localStorage.getItem("selectedLanguage") || "en";
}

// Get translation for background
function getBgTranslation(key) {
    const lang = getBackgroundLanguage();
    return bgTranslations[lang]?.[key] || bgTranslations["en"][key];
}

// Create context menu for adding selected text as todo
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "addTodo",
        title: getBgTranslation("addTodo"),
        contexts: ["selection"]
    });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "addTodo" && info.selectionText) {
        // Get current todo list
        chrome.storage.local.get("todoList", (result) => {
            const todoList = result.todoList || {};
            
            // Create new todo item (use translation keys internally)
            const id = "t" + Date.now();
            todoList[id] = {
                title: info.selectionText,
                status: "pending",
                pinned: false,
                category: "uncategorized",
                priority: "medium",
                createdAt: new Date().toISOString(),
                dueDate: null
            };
            
            // Save updated todo list
            chrome.storage.local.set({ todoList }, () => {
                // Update badge
                updateBadge();
            });
        });
    }
});

// Update badge with pending todo count
function updateBadge() {
    chrome.storage.local.get("todoList", (result) => {
        const todoList = result.todoList || {};
        let pendingCount = 0;
        
        // Count pending todos
        for (let id in todoList) {
            if (todoList[id].status === "pending") {
                pendingCount++;
            }
        }
        
        // Update badge
        if (pendingCount > 0) {
            chrome.action.setBadgeText({ text: pendingCount.toString() });
            chrome.action.setBadgeBackgroundColor({ color: "#ff4757" });
        } else {
            chrome.action.setBadgeText({ text: "" });
        }
    });
}

// Listen for storage changes to update badge
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && changes.todoList) {
        updateBadge();
    }
});

// Initial badge update
updateBadge();

// Check for due tasks and send notifications
function checkDueTasks() {
    chrome.storage.local.get("todoList", (result) => {
        const todoList = result.todoList || {};
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
                    chrome.notifications.create({
                        type: "basic",
                        iconUrl: "./favicon/icon48.png",
                        title: getBgTranslation("notificationTitle"),
                        message: `Task "${todo.title}" - ${isOverdue ? getBgTranslation("overdue") : getBgTranslation("dueToday")}`
                    });
                }
            }
        }
    });
}

// Check for due tasks every hour
setInterval(checkDueTasks, 3600000);

// Check on service worker start
checkDueTasks();
