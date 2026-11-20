
/* ==========================================
   DAYLIST TASK MANAGER
   Basic JavaScript + DOM Manipulation
   ========================================== */

// ---------------- VARIABLES ----------------

var STORAGE_KEY = "daylist-tasks-v1";

var tasks = [];
var currentFilter = "all";
var editingTaskId = null;

// Selecting HTML elements
var taskList = document.getElementById("taskList");
var taskForm = document.getElementById("taskForm");
var taskInput = document.getElementById("taskInput");
var editDialog = document.getElementById("editDialog");
var editInput = document.getElementById("editInput");


// ---------------- LOAD TASKS ----------------

function loadTasks() {

    var savedTasks = localStorage.getItem(STORAGE_KEY);

    if (savedTasks !== null) {
        try {
            tasks = JSON.parse(savedTasks);

            if (!Array.isArray(tasks)) {
                tasks = [];
            }

        } catch (error) {
            tasks = [];
        }
    }

}


// ---------------- SAVE TASKS ----------------

function saveTasks() {

    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));

}


// ---------------- ADD TASK ----------------

function addTask(title) {

    var newTask = {
        id: new Date().getTime(),
        title: title,
        completed: false,
        createdAt: new Date().toLocaleDateString()
    };

    tasks.unshift(newTask);

    saveTasks();
    displayTasks();

}


// Handle task form submission

taskForm.addEventListener("submit", function(event) {

    event.preventDefault();

    var title = taskInput.value.trim();
    var error = document.getElementById("inputError");

    if (title === "") {

        error.textContent = "Please write a task before adding it.";
        taskInput.focus();

    } else {

        error.textContent = "";

        addTask(title);

        taskInput.value = "";
        taskInput.focus();

    }

});


// ---------------- COMPLETE TASK ----------------

function toggleTask(id) {

    for (var i = 0; i < tasks.length; i++) {

        if (tasks[i].id == id) {

            if (tasks[i].completed === true) {
                tasks[i].completed = false;
            } else {
                tasks[i].completed = true;
            }

            break;
        }

    }

    saveTasks();
    displayTasks();

}


// ---------------- DELETE TASK ----------------

function deleteTask(id) {

    var newTasks = [];

    for (var i = 0; i < tasks.length; i++) {

        if (tasks[i].id != id) {
            newTasks.push(tasks[i]);
        }

    }

    tasks = newTasks;

    saveTasks();
    displayTasks();

}


// ---------------- EDIT TASK ----------------

function openEdit(id) {

    for (var i = 0; i < tasks.length; i++) {

        if (tasks[i].id == id) {

            editingTaskId = id;

            editInput.value = tasks[i].title;

            editDialog.showModal();
            editInput.focus();

            break;
        }

    }

}


// Save edited task

var editForm = document.getElementById("editForm");

editForm.addEventListener("submit", function(event) {

    event.preventDefault();

    var updatedTitle = editInput.value.trim();

    if (updatedTitle !== "" && editingTaskId !== null) {

        for (var i = 0; i < tasks.length; i++) {

            if (tasks[i].id == editingTaskId) {

                tasks[i].title = updatedTitle;

                break;
            }

        }

        saveTasks();

        editDialog.close();

        editingTaskId = null;

        displayTasks();

    }

});


// Cancel editing

document.getElementById("cancelEdit").addEventListener("click", function() {

    editDialog.close();
    editingTaskId = null;

});


// ---------------- CLEAR COMPLETED TASKS ----------------

document.getElementById("clearCompleted").addEventListener("click", function() {

    var remainingTasks = [];

    for (var i = 0; i < tasks.length; i++) {

        if (tasks[i].completed === false) {
            remainingTasks.push(tasks[i]);
        }

    }

    tasks = remainingTasks;

    saveTasks();
    displayTasks();

});


// ---------------- FILTER TASKS ----------------

function setFilter(filter) {

    currentFilter = filter;

    var buttons = document.querySelectorAll("[data-filter]");

    for (var i = 0; i < buttons.length; i++) {

        buttons[i].classList.remove("selected");
        buttons[i].classList.remove("active");

        if (buttons[i].getAttribute("data-filter") === filter) {

            if (buttons[i].classList.contains("side-link")) {
                buttons[i].classList.add("selected");
            }

            if (buttons[i].classList.contains("filter-btn")) {
                buttons[i].classList.add("active");
            }

        }

    }

    var heading = document.getElementById("listHeading");

    if (filter === "all") {
        heading.textContent = "All tasks";
    }
    else if (filter === "pending") {
        heading.textContent = "Pending tasks";
    }
    else {
        heading.textContent = "Completed tasks";
    }

    displayTasks();

}


// Add click events to filter buttons

var filterButtons = document.querySelectorAll("[data-filter]");

for (var i = 0; i < filterButtons.length; i++) {

    filterButtons[i].addEventListener("click", function() {

        var filter = this.getAttribute("data-filter");

        setFilter(filter);

    });

}


// ---------------- DISPLAY TASKS ----------------

function displayTasks() {

    var total = tasks.length;
    var completed = 0;
    var pending = 0;
    var visibleTasks = [];

    // Count completed and pending tasks

    for (var i = 0; i < tasks.length; i++) {

        if (tasks[i].completed === true) {
            completed++;
        } else {
            pending++;
        }

        // Apply selected filter

        if (currentFilter === "all") {
            visibleTasks.push(tasks[i]);
        }

        else if (currentFilter === "pending" && tasks[i].completed === false) {
            visibleTasks.push(tasks[i]);
        }

        else if (currentFilter === "completed" && tasks[i].completed === true) {
            visibleTasks.push(tasks[i]);
        }

    }


    // Calculate progress percentage

    var percentage = 0;

    if (total > 0) {
        percentage = Math.round((completed / total) * 100);
    }


    // Update statistics

    document.getElementById("totalStat").textContent = total;

    document.getElementById("pendingStat").textContent = pending;

    document.getElementById("completedStat").textContent = completed;

    document.getElementById("allCount").textContent = total;

    document.getElementById("progressPercent").textContent = percentage + "%";

    document.getElementById("progressBar").style.width = percentage + "%";


    // Update progress message

    var caption = document.getElementById("progressCaption");

    if (total === 0) {
        caption.textContent = "Let's get started!";
    }

    else if (percentage === 100) {
        caption.textContent = "Everything is complete. Great work!";
    }

    else {
        caption.textContent = completed + " of " + total + " tasks completed";
    }


    // Update visible task count

    var count = visibleTasks.length;

    if (count === 1) {
        document.getElementById("listSummary").textContent = "1 task shown";
    } else {
        document.getElementById("listSummary").textContent = count + " tasks shown";
    }


    // Clear previous task list

    taskList.innerHTML = "";


    // Display message if no tasks are available

    if (count === 0) {

        var emptyBox = document.createElement("div");
        emptyBox.className = "empty-state";

        var icon = document.createElement("div");
        icon.className = "empty-icon";
        icon.textContent = "✦";

        var title = document.createElement("strong");

        var message = document.createElement("p");

        if (currentFilter === "completed") {
            title.textContent = "No completed tasks yet";
        }

        else if (currentFilter === "pending") {
            title.textContent = "You're all caught up";
        }

        else {
            title.textContent = "Your task list is empty";
        }

        if (currentFilter === "all") {
            message.textContent = "Add a task above to get your day moving.";
        } else {
            message.textContent = "Try another filter or add a new task.";
        }

        emptyBox.appendChild(icon);
        emptyBox.appendChild(title);
        emptyBox.appendChild(message);

        taskList.appendChild(emptyBox);

        return;

    }


    // Create and display each task

    for (var i = 0; i < visibleTasks.length; i++) {

        var task = visibleTasks[i];

        var taskRow = document.createElement("article");
        taskRow.className = "task-row";

        if (task.completed === true) {
            taskRow.classList.add("done");
        }


        // Create checkbox

        var checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.className = "task-check";
        checkbox.checked = task.completed;

        checkbox.setAttribute("data-id", task.id);
        checkbox.setAttribute("aria-label", "Mark task as completed");


        // Create task title

        var title = document.createElement("span");

        title.className = "task-title";
        title.textContent = task.title;


        // Create task date

        var date = document.createElement("span");

        date.className = "task-date";
        date.textContent = task.createdAt;


        // Create action buttons

        var actions = document.createElement("div");
        actions.className = "task-actions";


        // Edit button

        var editButton = document.createElement("button");

        editButton.className = "icon-btn";
        editButton.type = "button";
        editButton.textContent = "✎";
        editButton.title = "Edit task";


        // Delete button

        var deleteButton = document.createElement("button");

        deleteButton.className = "icon-btn delete";
        deleteButton.type = "button";
        deleteButton.textContent = "×";
        deleteButton.title = "Delete task";


        // Add click events to buttons

        editButton.addEventListener("click", function() {

            var taskId = this.getAttribute("data-id");

            openEdit(taskId);

        });

        deleteButton.addEventListener("click", function() {

            var taskId = this.getAttribute("data-id");

            deleteTask(taskId);

        });


        editButton.setAttribute("data-id", task.id);
        deleteButton.setAttribute("data-id", task.id);


        // Add event to checkbox

        checkbox.addEventListener("change", function() {

            var taskId = this.getAttribute("data-id");

            toggleTask(taskId);

        });


        // Add elements to task row

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        taskRow.appendChild(checkbox);
        taskRow.appendChild(title);
        taskRow.appendChild(date);
        taskRow.appendChild(actions);

        taskList.appendChild(taskRow);

    }

}


// ---------------- TODAY'S DATE ----------------

var today = new Date();

document.getElementById("todayLabel").textContent =
    today.toDateString().toUpperCase();


// ---------------- START APPLICATION ----------------

loadTasks();

displayTasks();
