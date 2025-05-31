document.addEventListener('DOMContentLoaded', () => {
    // Rest of the application code
    const taskInput = document.getElementById('taskInput');
    const taskDescriptionInput = document.getElementById('taskDescriptionInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const noTasksMessage = document.getElementById('noTasksMessage');

    const upcomingTasksLink = document.getElementById('upcomingTasksLink');
    const todayTasksLink = document.getElementById('todayTasksLink');
    const completedTasksLink = document.getElementById('completedTasksLink');
    const calendarLink = document.getElementById('calendarLink');
    const stickyWallLink = document.getElementById('stickyWallLink');
    const addTaskMenuLink = document.getElementById('addTaskMenuLink');

    const upcomingTasksCount = document.getElementById('upcomingTasksCount');
    const todayTasksSidebarCount = document.getElementById('todayTasksSidebarCount');
    const completedTasksCount = document.getElementById('completedTasksCount');

    const mainHeaderTitle = document.getElementById('mainHeaderTitle');
    const addTaskSection = document.getElementById('addTaskSection');

    const taskDetailPane = document.getElementById('taskDetailPane');
    const detailTaskName = document.getElementById('detailTaskName');
    const detailDescription = document.getElementById('detailDescription');
    const detailList = document.getElementById('detailList');
    const detailDueDate = document.getElementById('detailDueDate');
    const detailTagsSection = document.getElementById('detailTagsSection');
    const detailSubtasksSection = document.getElementById('detailSubtasksSection');

    const calendarView = document.getElementById('calendarView');
    const stickyWallView = document.getElementById('stickyWallView');
    const noStickyNotesMessage = document.getElementById('noStickyNotesMessage');

    const prevPeriodBtn = document.getElementById('prevPeriodBtn');
    const nextPeriodBtn = document.getElementById('nextPeriodBtn');
    const currentPeriodRange = document.getElementById('currentPeriodRange');
    const calendarDaysContainer = document.getElementById('calendarDaysContainer');

    const calendarDayBtn = document.getElementById('calendarDayBtn');
    const calendarWeekBtn = document.getElementById('calendarWeekBtn');
    const calendarMonthBtn = document = document.getElementById('calendarMonthBtn');

    const API_BASE_URL = 'http://localhost:3000/api/tasks';

    let currentSelectedTask = null;
    let currentFilter = 'today';
    let allTasksData = [];
    let currentCalendarDate = new Date();
    let calendarViewMode = 'day';

    const timeSlotHeight = 48;
    const calendarEventColor = '#A8C4D9';

    // Theme toggle elements
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;

    // Set default theme to dark if not already set (e.g., from local storage)
    if (!localStorage.getItem('theme')) {
        htmlElement.classList.add('dark');
        themeToggle.querySelector('i').classList.remove('fa-sun');
        themeToggle.querySelector('i').classList.add('fa-moon');
    } else if (localStorage.getItem('theme') === 'dark') {
        htmlElement.classList.add('dark');
        themeToggle.querySelector('i').classList.remove('fa-sun');
        themeToggle.querySelector('i').classList.add('fa-moon');
    } else {
        htmlElement.classList.remove('dark');
        themeToggle.querySelector('i').classList.remove('fa-moon');
        themeToggle.querySelector('i').classList.add('fa-sun');
    }


    themeToggle.addEventListener('click', () => {
        htmlElement.classList.toggle('dark');
        if (htmlElement.classList.contains('dark')) {
            themeToggle.querySelector('i').classList.remove('fa-sun');
            themeToggle.querySelector('i').classList.add('fa-moon');
            localStorage.setItem('theme', 'dark');
        } else {
            themeToggle.querySelector('i').classList.remove('fa-moon');
            themeToggle.querySelector('i').classList.add('fa-sun');
            localStorage.setItem('theme', 'light');
        }
    });


    const normalizeDate = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const getStartOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        d.setDate(d.getDate() - day);
        return normalizeDate(d);
    };

    async function fetchAndRenderTasks() {
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allTasksData = await response.json();
            renderCurrentView();
        } catch (error) {
            console.error('Error fetching tasks:', error);
            taskList.innerHTML = '<p class="text-red-500 text-center">Failed to load tasks. Please ensure the backend is running.</p>';
            noTasksMessage.classList.add('hidden');
            calendarView.classList.add('hidden');
            stickyWallView.classList.add('hidden');
            addTaskSection.classList.remove('hidden');
        }
    }

    function renderTaskList(tasksToDisplay) {
        taskList.innerHTML = '';
        noTasksMessage.classList.add('hidden');

        if (tasksToDisplay.length === 0) {
            noTasksMessage.classList.remove('hidden');
            return;
        }

        tasksToDisplay.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        const groupedTasks = {};
        tasksToDisplay.forEach(task => {
            const date = new Date(task.dueDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            if (!groupedTasks[date]) {
                groupedTasks[date] = [];
            }
            groupedTasks[date].push(task);
        });

        for (const date in groupedTasks) {
            const dateHeading = document.createElement('h2');
            dateHeading.className = 'text-xl font-semibold text-gray-700 mt-6 mb-3 border-b pb-2';
            dateHeading.textContent = date;
            taskList.appendChild(dateHeading);

            groupedTasks[date].forEach(task => {
                const taskItem = document.createElement('div');
                taskItem.className = `task-item flex items-center justify-between p-4 bg-white rounded-lg shadow-sm cursor-pointer hover:bg-gray-50`;
                taskItem.dataset.id = task._id;
                taskItem.dataset.completed = task.completed;

                let menuButtonsHtml = '';
                if (task.completed) {
                    menuButtonsHtml = `
                        <div class="task-list-item-menu flex flex-col gap-1 min-w-[140px]">
                            <div class="flex gap-1">
                                <button class="view-task-btn bg-gray-600 hover:bg-gray-700 text-white px-1.5 py-0.5 rounded text-xs flex-1">View Task</button>
                                <button class="delete-task-btn bg-red-600 hover:bg-red-700 text-white px-1.5 py-0.5 rounded text-xs flex-1">Delete Task</button>
                            </div>
                        </div>
                    `;
                } else {
                    menuButtonsHtml = `
                        <div class="task-list-item-menu flex flex-col gap-1 min-w-[140px]">
                            <div class="flex gap-1">
                                <button class="view-task-btn bg-gray-600 hover:bg-gray-700 text-white px-1.5 py-0.5 rounded text-xs flex-1">View Task</button>
                                <button class="update-task-btn bg-blue-600 hover:bg-blue-700 text-white px-1.5 py-0.5 rounded text-xs flex-1">Update Task</button>
                            </div>
                            <div class="flex gap-1">
                                <button class="mark-done-btn bg-green-600 hover:bg-green-700 text-white px-1.5 py-0.5 rounded text-xs flex-1">Mark as Done</button>
                                <button class="delete-task-btn bg-red-600 hover:bg-red-700 text-white px-1.5 py-0.5 rounded text-xs flex-1">Delete Task</button>
                            </div>
                        </div>
                    `;
                }

                taskItem.innerHTML = `
                    <div class="task-content flex-grow ${task.completed ? 'line-through text-gray-500' : ''}">
                        <p class="${task.completed ? 'text-gray-500' : 'text-gray-800'} font-medium">${task.name}</p>
                        <p class="text-sm ${task.completed ? 'text-gray-400' : 'text-gray-500'}">Due: ${new Date(task.dueDate).toLocaleDateString()}</p>
                    </div>
                    ${menuButtonsHtml}
                `;

                taskItem.querySelector('.view-task-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    showTaskDetails(task, true);
                });

                if (!task.completed) {
                    const updateBtn = taskItem.querySelector('.update-task-btn');
                    if (updateBtn) {
                        updateBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            showTaskDetails(task, false);
                        });
                    }

                    const markDoneBtn = taskItem.querySelector('.mark-done-btn');
                    if (markDoneBtn) {
                        markDoneBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            toggleTaskCompletion(task._id, task.completed);
                        });
                    }
                }

                const deleteBtn = taskItem.querySelector('.delete-task-btn');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        deleteTask(task._id);
                    });
                }

                taskList.appendChild(taskItem);
            });
        }
    }

    function renderCalendarView(allTasks, mode) {
        const timeColumn = calendarView.querySelector('.time-column');
        timeColumn.innerHTML = '';
        calendarDaysContainer.innerHTML = '';

        for (let h = 0; h < 24; h++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.textContent = `${h === 0 ? 12 : (h > 12 ? h - 12 : h)}${h < 12 ? ' AM' : ' PM'}`;
            timeColumn.appendChild(timeSlot);
        }

        const today = normalizeDate(new Date());
        const currentHour = new Date().getHours();
        const currentMinutes = new Date().getMinutes();

        let daysToDisplay = [];
        let headerText = '';

        if (mode === 'day') {
            daysToDisplay.push(currentCalendarDate);
            headerText = currentCalendarDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        } else if (mode === 'week') {
            const startOfWeek = getStartOfWeek(currentCalendarDate);
            for (let i = 0; i < 7; i++) {
                const day = new Date(startOfWeek);
                day.setDate(startOfWeek.getDate() + i);
                daysToDisplay.push(day);
            }
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            headerText = `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        } else if (mode === 'month') {
            const startOfMonth = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), 1);
            const endOfMonth = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 0);

            const startOfWeek = getStartOfWeek(currentCalendarDate);
            for (let i = 0; i < 7; i++) {
                const day = new Date(startOfWeek);
                day.setDate(startOfWeek.getDate() + i);
                daysToDisplay.push(day);
            }
            headerText = currentCalendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }

        currentPeriodRange.textContent = headerText;

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        daysToDisplay.forEach((dayDate, index) => {
            const normalizedDay = normalizeDate(dayDate);
            const dayColumn = document.createElement('div');
            dayColumn.className = 'calendar-day-column';

            const dayHeader = document.createElement('div');
            dayHeader.className = `day-header ${normalizedDay.getTime() === today.getTime() ? 'current-day-header' : ''}`;
            dayHeader.innerHTML = `<span class="day-name">${dayNames[dayDate.getDay()]}</span><span class="day-number">${dayDate.getDate()}</span>`;
            dayColumn.appendChild(dayHeader);

            for (let h = 0; h < 24; h++) {
                const dayGridSlot = document.createElement('div');
                dayGridSlot.className = 'day-grid-slot';
                dayGridSlot.dataset.date = normalizedDay.toISOString().split('T')[0];
                dayGridSlot.dataset.hour = h;
                dayColumn.appendChild(dayGridSlot);

                if (normalizedDay.getTime() === today.getTime() && h === currentHour) {
                    const timeSlotToMark = timeColumn.children[h];
                    const existingLine = timeSlotToMark.querySelector('.current-time-line');
                    if (existingLine) existingLine.remove();

                    const currentTimeLine = document.createElement('div');
                    currentTimeLine.className = 'current-time-line';
                    currentTimeLine.style.top = `${(currentMinutes / 60) * 100}%`;
                    timeSlotToMark.appendChild(currentTimeLine);
                }
            }
            calendarDaysContainer.appendChild(dayColumn);
        });

        const activeTasksForCalendar = allTasks.filter(task => !task.completed);

        activeTasksForCalendar.forEach(task => {
            const taskDueDate = new Date(task.dueDate);
            const taskDay = normalizeDate(taskDueDate);
            const taskHour = taskDueDate.getHours();
            const taskMinute = taskDueDate.getMinutes();
            const taskEndTime = new Date(taskDueDate);
            taskEndTime.setHours(taskHour + 1);

            const isTaskInView = daysToDisplay.some(day => normalizeDate(day).getTime() === taskDay.getTime());

            if (isTaskInView) {
                const dayIndex = daysToDisplay.findIndex(day => normalizeDate(day).getTime() === taskDay.getTime());
                const targetDayColumn = calendarDaysContainer.children[dayIndex];

                if (targetDayColumn) {
                    const taskEvent = document.createElement('div');
                    taskEvent.className = `calendar-task-event ${task.completed ? 'completed' : ''}`;
                    taskEvent.style.backgroundColor = calendarEventColor;

                    const startMinutes = taskHour * 60 + taskMinute;
                    const endMinutes = taskEndTime.getHours() * 60 + taskEndTime.getMinutes();
                    const durationMinutes = endMinutes - startMinutes;

                    const topPositionPx = (taskMinute / 60) * timeSlotHeight;
                    const heightPx = (durationMinutes / 60) * timeSlotHeight;

                    taskEvent.style.top = `${topPositionPx}px`;
                    taskEvent.style.height = `${heightPx}px`;
                    taskEvent.style.minHeight = '20px';

                    taskEvent.innerHTML = `
                        <div class="font-semibold">${task.name}</div>
                        <div class="text-xs">${taskDueDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                    `;
                    taskEvent.dataset.id = task._id;
                    taskEvent.dataset.completed = task.completed;

                    taskEvent.addEventListener('click', (e) => {
                        e.stopPropagation();
                        showTaskDetails(task);
                    });

                    targetDayColumn.appendChild(taskEvent);
                }
            }
        });
    }

    async function toggleTaskCompletion(taskId, currentStatus) {
        try {
            const response = await fetch(`${API_BASE_URL}/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ completed: !currentStatus }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const messageBox = document.createElement('div');
            messageBox.className = 'fixed top-4 right-4 bg-green-500 text-white p-3 rounded-lg shadow-lg';
            document.body.appendChild(messageBox);
            messageBox.textContent = `Task marked as ${!currentStatus ? 'done' : 'undone'}!`;
            setTimeout(() => messageBox.remove(), 3000);

            // Re-fetch tasks to update counts and views
            fetchAndRenderTasks();
        } catch (error) {
            console.error('Error toggling task completion:', error);
            const messageBox = document.createElement('div');
            messageBox.className = 'fixed top-4 right-4 bg-red-500 text-white p-3 rounded-lg shadow-lg';
            messageBox.textContent = 'Failed to update task status. Please try again.';
            document.body.appendChild(messageBox);
            setTimeout(() => messageBox.remove(), 3000);
        }
    }

    async function deleteTask(taskId) {
        const confirmDelete = document.createElement('div');
        confirmDelete.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        confirmDelete.innerHTML = `
            <div class="dialog-box p-6 rounded-lg shadow-xl text-center"> <p class="dialog-message mb-4 text-lg">Are you sure you want to delete this task?</p> <button id="confirmDeleteYes" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg mr-2">Yes, Delete</button>
                <button id="confirmDeleteNo" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg">No, Cancel</button>
            </div>
        `;
        document.body.appendChild(confirmDelete);

        document.getElementById('confirmDeleteYes').addEventListener('click', async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/${taskId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const messageBox = document.createElement('div');
                messageBox.className = 'fixed top-4 right-4 bg-green-500 text-white p-3 rounded-lg shadow-lg';
                messageBox.textContent = 'Task deleted successfully!';
                document.body.appendChild(messageBox);
                setTimeout(() => messageBox.remove(), 3000);

                confirmDelete.remove();
                currentSelectedTask = null;
                taskDetailPane.classList.add('hidden');
                // Re-fetch tasks to update counts and views after deletion
                fetchAndRenderTasks();
            } catch (error) {
                console.error('Error deleting task:', error);
                const messageBox = document.createElement('div');
                messageBox.className = 'fixed top-4 right-4 bg-red-500 text-white p-3 rounded-lg shadow-lg';
                messageBox.textContent = 'Failed to delete task. Please try again.';
                document.body.appendChild(messageBox);
                setTimeout(() => messageBox.remove(), 3000);
                confirmDelete.remove();
            }
        });

        document.getElementById('confirmDeleteNo').addEventListener('click', () => {
            confirmDelete.remove();
        });
    }

    prevPeriodBtn.addEventListener('click', () => {
        if (calendarViewMode === 'day') {
            currentCalendarDate.setDate(currentCalendarDate.getDate() - 1);
        } else if (calendarViewMode === 'week') {
            currentCalendarDate.setDate(currentCalendarDate.getDate() - 7);
        } else if (calendarViewMode === 'month') {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        }
        renderCurrentView();
    });

    nextPeriodBtn.addEventListener('click', () => {
        if (calendarViewMode === 'day') {
            currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
        } else if (calendarViewMode === 'week') {
            currentCalendarDate.setDate(currentCalendarDate.getDate() + 7);
        } else if (calendarViewMode === 'month') {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        }
        renderCurrentView();
    });

    calendarDayBtn.addEventListener('click', () => {
        calendarViewMode = 'day';
        currentCalendarDate = new Date();
        renderCurrentView();
    });

    calendarWeekBtn.addEventListener('click', () => {
        calendarViewMode = 'week';
        currentCalendarDate = new Date();
        renderCurrentView();
    });

    calendarMonthBtn.addEventListener('click', () => {
        calendarViewMode = 'month';
        currentCalendarDate = new Date();
        renderCurrentView();
    });

    function updateCalendarViewModeButtons() {
        [calendarDayBtn, calendarWeekBtn, calendarMonthBtn].forEach(btn => {
            btn.classList.remove('bg-blue-100', 'text-blue-700');
            btn.classList.add('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
        });

        if (calendarViewMode === 'day') {
            calendarDayBtn.classList.add('bg-blue-100', 'text-blue-700');
            calendarDayBtn.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
        } else if (calendarViewMode === 'week') {
            calendarWeekBtn.classList.add('bg-blue-100', 'text-blue-700');
            calendarWeekBtn.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
        } else if (calendarViewMode === 'month') {
            calendarMonthBtn.classList.add('bg-blue-100', 'text-blue-700');
            calendarMonthBtn.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
        }
    }

    function renderStickyWallView(allTasks) {
        stickyWallView.innerHTML = '';
        noStickyNotesMessage.classList.add('hidden');

        const activeTasks = allTasks.filter(task => !task.completed);

        if (activeTasks.length === 0) {
            noStickyNotesMessage.classList.remove('hidden');
            return;
        }

        const colors = ['#fef08a', '#a7f3d0', '#bfdbfe', '#fbcfe8', '#dbeafe'];

        activeTasks.forEach(task => {
            const stickyNote = document.createElement('div');
            stickyNote.className = 'sticky-note';
            stickyNote.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            stickyNote.dataset.id = task._id;

            stickyNote.innerHTML = `
                <h3>${task.name}</h3>
                <p>${task.description || 'No description provided.'}</p>
                <div class="sticky-date">Due: ${new Date(task.dueDate).toLocaleDateString()}</div>
            `;
            stickyWallView.appendChild(stickyNote);
        });
    }

    function updateSidebarActiveLink() {
        document.querySelectorAll('aside nav ul li a').forEach(link => {
            link.classList.remove('bg-blue-100', 'text-blue-700', 'font-medium');
            link.classList.add('hover:bg-gray-100', 'text-gray-700');
        });

        let activeLink;
        if (currentFilter === 'today') {
            activeLink = todayTasksLink;
        } else if (currentFilter === 'upcoming') {
            activeLink = upcomingTasksLink;
        } else if (currentFilter === 'completed') {
            activeLink = completedTasksLink;
        } else if (currentFilter === 'calendar') {
            activeLink = calendarLink;
        } else if (currentFilter === 'stickywall') {
            activeLink = stickyWallLink;
        } else if (currentFilter === 'addTask') {
            activeLink = addTaskMenuLink;
        }

        if (activeLink) {
            activeLink.classList.add('bg-blue-100', 'text-blue-700', 'font-medium');
            activeLink.classList.remove('hover:bg-gray-100', 'text-gray-700');
        }
    }

    addTaskBtn.addEventListener('click', async () => {
        const taskName = taskInput.value.trim();
        const taskDescription = taskDescriptionInput.value.trim();
        const dueDate = dueDateInput.value;

        if (taskName && dueDate) {
            try {
                const response = await fetch(API_BASE_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name: taskName, description: taskDescription, dueDate: dueDate }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                taskInput.value = '';
                taskDescriptionInput.value = '';
                dueDateInput.value = '';
                fetchAndRenderTasks();
            } catch (error) {
                console.error('Error adding task:', error);
                const messageBox = document.createElement('div');
                messageBox.className = 'fixed top-4 right-4 bg-red-500 text-white p-3 rounded-lg shadow-lg';
                messageBox.textContent = 'Failed to add task. Please try again.';
                document.body.appendChild(messageBox);
                setTimeout(() => messageBox.remove(), 3000);
            }
        } else {
            const messageBox = document.createElement('div');
            messageBox.className = 'fixed top-4 right-4 bg-yellow-500 text-white p-3 rounded-lg shadow-lg';
            messageBox.textContent = 'Please enter both a task name and a due date/time.';
            document.body.appendChild(messageBox);
            setTimeout(() => messageBox.remove(), 3000);
        }
    });

    taskList.addEventListener('click', async (event) => {
        const taskItem = event.target.closest('.task-item');
        if (!taskItem) return;

        const taskId = taskItem.dataset.id;

        try {
            const response = await fetch(`${API_BASE_URL}/${taskId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const task = await response.json();
        } catch (error) {
            console.error('Error fetching task details:', error);
            const messageBox = document.createElement('div');
            messageBox.className = 'fixed top-4 right-4 bg-red-500 text-white p-3 rounded-lg shadow-lg';
            messageBox.textContent = 'Failed to load task details.';
            document.body.appendChild(messageBox);
            setTimeout(() => messageBox.remove(), 3000);
        }
    });

    function showTaskDetails(task, isViewOnly = false) {
        currentSelectedTask = task;
        detailTaskName.value = task.name;
        detailDescription.value = task.description || '';
        detailList.value = task.list || 'Personal';
        detailDueDate.value = new Date(task.dueDate).toISOString().slice(0, 16);

        detailTaskName.readOnly = isViewOnly;
        detailDescription.readOnly = isViewOnly;
        detailList.disabled = isViewOnly;
        detailDueDate.readOnly = isViewOnly;

        detailTagsSection.style.display = isViewOnly ? 'none' : 'block';
        detailSubtasksSection.style.display = isViewOnly ? 'none' : 'block';

        const saveBtn = taskDetailPane.querySelector('.bg-yellow-500');
        const deleteBtn = taskDetailPane.querySelector('.bg-red-500');
        if (saveBtn) saveBtn.style.display = isViewOnly ? 'none' : 'inline-block';
        if (deleteBtn) deleteBtn.style.display = isViewOnly ? 'none' : 'inline-block';

        taskDetailPane.classList.remove('hidden');
    }

    const saveChangesBtn = taskDetailPane.querySelector('.bg-yellow-500');
    if (saveChangesBtn) {
        saveChangesBtn.addEventListener('click', async () => {
            if (!currentSelectedTask) {
                const messageBox = document.createElement('div');
                messageBox.className = 'fixed top-4 right-4 bg-orange-500 text-white p-3 rounded-lg shadow-lg';
                messageBox.textContent = 'No task selected to save changes.';
                document.body.appendChild(messageBox);
                setTimeout(() => messageBox.remove(), 3000);
                return;
            }

            const updatedTask = {
                name: detailTaskName.value.trim(),
                description: detailDescription.value.trim(),
                list: detailList.value,
                dueDate: detailDueDate.value,
            };

            try {
                const response = await fetch(`${API_BASE_URL}/${currentSelectedTask._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedTask),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const messageBox = document.createElement('div');
                messageBox.className = 'fixed top-4 right-4 bg-green-500 text-white p-3 rounded-lg shadow-lg';
                messageBox.textContent = 'Task updated successfully!';
                document.body.appendChild(messageBox);
                setTimeout(() => messageBox.remove(), 3000);

                fetchAndRenderTasks();
            } catch (error) {
                console.error('Error saving task changes:', error);
                const messageBox = document.createElement('div');
                messageBox.className = 'fixed top-4 right-4 bg-red-500 text-white p-3 rounded-lg shadow-lg';
                messageBox.textContent = 'Failed to save changes. Please try again.';
                document.body.appendChild(messageBox);
                setTimeout(() => messageBox.remove(), 3000);
            }
        });
    }

    const deleteTaskBtn = taskDetailPane.querySelector('.bg-red-500');
    if (deleteTaskBtn) {
        deleteTaskBtn.addEventListener('click', async () => {
            if (!currentSelectedTask) {
                const messageBox = document.createElement('div');
                messageBox.className = 'fixed top-4 right-4 bg-orange-500 text-white p-3 rounded-lg shadow-lg';
                messageBox.textContent = 'No task selected to delete.';
                document.body.appendChild(messageBox);
                setTimeout(() => messageBox.remove(), 3000);
                return;
            }

            const confirmDelete = document.createElement('div');
            confirmDelete.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            confirmDelete.innerHTML = `
                <div class="dialog-box p-6 rounded-lg shadow-xl text-center"> <p class="dialog-message mb-4 text-lg">Are you sure you want to delete this task?</p> <button id="confirmDeleteYes" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg mr-2">Yes, Delete</button>
                    <button id="confirmDeleteNo" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg">No, Cancel</button>
                </div>
            `;
            document.body.appendChild(confirmDelete);

            document.getElementById('confirmDeleteYes').addEventListener('click', async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}/${currentSelectedTask._id}`, {
                        method: 'DELETE',
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const messageBox = document.createElement('div');
                    messageBox.className = 'fixed top-4 right-4 bg-green-500 text-white p-3 rounded-lg shadow-lg';
                    messageBox.textContent = 'Task deleted successfully!';
                    document.body.appendChild(messageBox);
                    setTimeout(() => messageBox.remove(), 3000);

                    confirmDelete.remove();
                    currentSelectedTask = null;
                    taskDetailPane.classList.add('hidden');
                    fetchAndRenderTasks();
                } catch (error) {
                    console.error('Error deleting task:', error);
                    const messageBox = document.createElement('div');
                    messageBox.className = 'fixed top-4 right-4 bg-red-500 text-white p-3 rounded-lg shadow-lg';
                    messageBox.textContent = 'Failed to delete task. Please try again.';
                    document.body.appendChild(messageBox);
                    setTimeout(() => messageBox.remove(), 3000);
                    confirmDelete.remove();
                }
            });

            document.getElementById('confirmDeleteNo').addEventListener('click', () => {
                confirmDelete.remove();
            });
        });
    }

    upcomingTasksLink.addEventListener('click', (e) => {
        e.preventDefault();
        currentFilter = 'upcoming';
        fetchAndRenderTasks();
    });

    todayTasksLink.addEventListener('click', (e) => {
        e.preventDefault();
        currentFilter = 'today';
        fetchAndRenderTasks();
    });

    completedTasksLink.addEventListener('click', (e) => {
        e.preventDefault();
        currentFilter = 'completed';
        fetchAndRenderTasks();
    });

    calendarLink.addEventListener('click', (e) => {
        e.preventDefault();
        currentFilter = 'calendar';
        currentCalendarDate = new Date();
        renderCurrentView();
    });

    stickyWallLink.addEventListener('click', (e) => {
        e.preventDefault();
        currentFilter = 'stickywall';
        fetchAndRenderTasks();
    });

    addTaskMenuLink.addEventListener('click', (e) => {
        e.preventDefault();
        currentFilter = 'addTask';
        fetchAndRenderTasks();
    });

    function renderCurrentView() {
        taskList.classList.add('hidden');
        calendarView.classList.add('hidden');
        stickyWallView.classList.add('hidden');
        taskDetailPane.classList.add('hidden');
        addTaskSection.classList.add('hidden');

        let filteredTasks = [];
        const today = normalizeDate(new Date());

        let todayCount = 0;
        let upcomingCount = 0;
        let completedCount = 0;
        let stickyWallCount = 0;

        allTasksData.forEach(task => {
            const taskDueDate = normalizeDate(task.dueDate);
            if (task.completed) {
                completedCount++;
            } else {
                stickyWallCount++;
                if (taskDueDate.getTime() === today.getTime()) {
                    todayCount++;
                } else if (taskDueDate.getTime() > today.getTime()) {
                    upcomingCount++;
                }
            }
        });

        upcomingTasksCount.textContent = upcomingCount;
        todayTasksSidebarCount.textContent = todayCount;
        completedTasksCount.textContent = completedCount;

        if (currentFilter === 'stickywall') {
            mainHeaderTitle.innerHTML = `Sticky Wall View <span class="text-blue-600 ml-2">${stickyWallCount}</span>`;
        }


        if (currentFilter === 'today') {
            filteredTasks = allTasksData.filter(task => normalizeDate(task.dueDate).getTime() === today.getTime() && !task.completed);
            mainHeaderTitle.innerHTML = `Today <span class="text-blue-600 ml-2">${todayCount}</span>`;
            taskList.classList.remove('hidden');
            renderTaskList(filteredTasks);
        } else if (currentFilter === 'upcoming') {
            filteredTasks = allTasksData.filter(task => normalizeDate(task.dueDate).getTime() > today.getTime() && !task.completed);
            mainHeaderTitle.innerHTML = `Upcoming <span class="text-blue-600 ml-2">${upcomingCount}</span>`;
            taskList.classList.remove('hidden');
            renderTaskList(filteredTasks);
        } else if (currentFilter === 'completed') {
            filteredTasks = allTasksData.filter(task => task.completed);
            mainHeaderTitle.innerHTML = `Completed <span class="text-blue-600 ml-2">${completedCount}</span>`;
            taskList.classList.remove('hidden');
            renderTaskList(filteredTasks);
        } else if (currentFilter === 'calendar') {
            mainHeaderTitle.innerHTML = `Calendar View`;
            calendarView.classList.remove('hidden');
            renderCalendarView(allTasksData, calendarViewMode);
        } else if (currentFilter === 'stickywall') {
            mainHeaderTitle.innerHTML = `Sticky Wall View <span class="text-blue-600 ml-2">${stickyWallCount}</span>`;
            stickyWallView.classList.remove('hidden');
            renderStickyWallView(allTasksData);
        } else if (currentFilter === 'addTask') {
            mainHeaderTitle.innerHTML = `Add New Task`;
            addTaskSection.classList.remove('hidden');
            taskList.classList.add('hidden');
            calendarView.classList.add('hidden');
            stickyWallView.classList.add('hidden');
        }

        updateSidebarActiveLink();
        updateCalendarViewModeButtons();
    }

    fetchAndRenderTasks();
});