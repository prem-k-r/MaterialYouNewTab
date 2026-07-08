// Background service worker for Material You New Tab

const REMINDER_ALARM_NAME = "todoDueTaskReminder";

const defaultBgTranslations = {
    addTodo: "Add to To Do List",
    notificationTitle: "To Do Reminder",
    overdue: "Overdue",
    dueToday: "Due today"
};

function storageGet(keys) {
    return new Promise((resolve) => chrome.storage.local.get(keys, resolve));
}

function storageSet(values) {
    return new Promise((resolve) => chrome.storage.local.set(values, resolve));
}

function getDateKey(value = new Date()) {
    if (typeof value === "string") {
        const match = value.match(/^\d{4}-\d{2}-\d{2}/);
        if (match) return match[0];
        return null;
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    const localMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const offset = localMidnight.getTimezoneOffset() * 60000;
    return new Date(localMidnight.getTime() - offset).toISOString().split("T")[0];
}

async function getBgTranslations() {
    const { backgroundTodoTranslations } = await storageGet("backgroundTodoTranslations");
    return {
        ...defaultBgTranslations,
        ...(backgroundTodoTranslations || {})
    };
}

async function getBgTranslation(key) {
    const translations = await getBgTranslations();
    return translations[key] || defaultBgTranslations[key] || key;
}

async function refreshContextMenu() {
    if (!chrome.contextMenus) return;

    const title = await getBgTranslation("addTodo");
    chrome.contextMenus.remove("addTodo", () => {
        chrome.contextMenus.create({
            id: "addTodo",
            title,
            contexts: ["selection"]
        });
    });
}

async function addSelectedTextAsTodo(selectionText) {
    const { todoList = {} } = await storageGet("todoList");
    const id = "t" + Date.now();

    todoList[id] = {
        title: selectionText,
        status: "pending",
        pinned: false,
        category: "uncategorized",
        priority: "medium",
        createdAt: new Date().toISOString(),
        dueDate: null
    };

    await storageSet({ todoList });
    updateBadge();
}

function updateBadge() {
    chrome.storage.local.get("todoList", (result) => {
        const todoList = result.todoList || {};
        const pendingCount = Object.values(todoList).filter((todo) => todo.status === "pending").length;
        const actionApi = chrome.action || chrome.browserAction;
        if (!actionApi) return;

        if (pendingCount > 0) {
            actionApi.setBadgeText({ text: pendingCount.toString() });
            actionApi.setBadgeBackgroundColor({ color: "#ff4757" });
        } else {
            actionApi.setBadgeText({ text: "" });
        }
    });
}

async function checkDueTasks() {
    const { todoList = {}, todoReminderState = {} } = await storageGet(["todoList", "todoReminderState"]);
    const translations = await getBgTranslations();
    const todayKey = getDateKey();
    const nextReminderState = {};

    for (const [id, todo] of Object.entries(todoList)) {
        const dueDateKey = getDateKey(todo.dueDate || "");
        if (todo.status !== "pending" || !dueDateKey || dueDateKey > todayKey) {
            continue;
        }

        const isOverdue = dueDateKey < todayKey;
        const reminderKey = `${todayKey}:${isOverdue ? "overdue" : "dueToday"}`;
        nextReminderState[id] = reminderKey;

        if (todoReminderState[id] === reminderKey) {
            continue;
        }

        chrome.notifications.create({
            type: "basic",
            iconUrl: "./favicon/icon48.png",
            title: translations.notificationTitle,
            message: `Task "${todo.title}" - ${isOverdue ? translations.overdue : translations.dueToday}`
        });
    }

    await storageSet({ todoReminderState: nextReminderState });
}

function scheduleDueTaskChecks() {
    chrome.alarms.create(REMINDER_ALARM_NAME, {
        delayInMinutes: 1,
        periodInMinutes: 60
    });
}

chrome.runtime.onInstalled.addListener(() => {
    refreshContextMenu();
    scheduleDueTaskChecks();
    updateBadge();
    checkDueTasks();
});

chrome.runtime.onStartup?.addListener(() => {
    scheduleDueTaskChecks();
    updateBadge();
    checkDueTasks();
});

chrome.contextMenus?.onClicked.addListener((info) => {
    if (info.menuItemId === "addTodo" && info.selectionText) {
        addSelectedTextAsTodo(info.selectionText);
    }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;

    if (changes.todoList) {
        updateBadge();
    }

    if (changes.backgroundTodoTranslations) {
        refreshContextMenu();
    }
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === REMINDER_ALARM_NAME) {
        checkDueTasks();
    }
});

updateBadge();
