document.addEventListener('DOMContentLoaded', () => {
    // Input elements for Add Task section
    const taskInput = document.getElementById('taskInput');
    const taskDescriptionInput = document.getElementById('taskDescriptionInput');
    const dueDateInput = document.getElementById('dueDateInput'); // Date input
    const dueTimeInput = document.getElementById('dueTimeInput'); // Time input - NEW
    const listInput = document.getElementById('listInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const noTasksMessage = document.getElementById('noTasksMessage');

    // Sidebar navigation links
    const upcomingTasksLink = document.getElementById('upcomingTasksLink');
    const todayTasksLink = document.getElementById('todayTasksLink');
    const completedTasksLink = document.getElementById('completedTasksLink');
    const calendarLink = document.getElementById('calendarLink');
    const stickyWallLink = document.getElementById('stickyWallLink');
    const addTaskMenuLink = document.getElementById('addTaskMenuLink');

    // Sidebar counts
    const upcomingTasksCount = document.getElementById('upcomingTasksCount');
    const todayTasksSidebarCount = document.getElementById('todayTasksSidebarCount');
    const completedTasksCount = document = document.getElementById('completedTasksCount');

    // Main header and sections
    const mainHeaderTitle = document.getElementById('mainHeaderTitle');
    const addTaskSection = document.getElementById('addTaskSection');

    // Task Detail Pane elements
    const taskDetailPane = document.getElementById('taskDetailPane');
    const detailTaskName = document.getElementById('detailTaskName');
    const detailDescription = document.getElementById('detailDescription');
    const detailList = document.getElementById('detailList');
    const detailDueDate = document.getElementById('detailDueDate'); // Date input for detail pane
    const detailDueTime = document.getElementById('detailDueTime'); // Time input for detail pane - NEW
    const detailTagsSection = document.getElementById('detailTagsSection');
    const detailSubtasksSection = document.getElementById('detailSubtasksSection');

    // Calendar view elements
    const calendarView = document.getElementById('calendarView');
    const stickyWallView = document.getElementById('stickyWallView');
    const noStickyNotesMessage = document.getElementById('noStickyNotesMessage');

    const prevPeriodBtn = document.getElementById('prevPeriodBtn');
    const nextPeriodBtn = document.getElementById('nextPeriodBtn');
    const currentPeriodRange = document.getElementById('currentPeriodRange');
    const calendarDaysContainer = document.getElementById('calendarDaysContainer');

    const calendarDayBtn = document.getElementById('calendarDayBtn');
    const calendarWeekBtn = document.getElementById('calendarWeekBtn');
    const calendarMonthBtn = document.getElementById('calendarMonthBtn');

    // List management elements
    const listMenu = document.getElementById('listMenu');
    const addNewListMenuLink = document.getElementById('addNewListMenuLink');

    const API_BASE_URL = 'http://localhost:3000/api/tasks';

    let currentSelectedTask = null;
    let currentFilter = 'today';
    let currentFilterList = null; // Stores the name of the currently selected list filter
    let allTasksData = [];
    let currentCalendarDate = new Date();
    let calendarViewMode = 'day';
    // Initial default lists
    let availableLists = new Set(['Personal', 'Work', 'Groceries', 'Home']);

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
        // Re-render task list to apply theme-dependent styles immediately
        renderCurrentView();
    });

    // Function to get today's date in ISO format (YYYY-MM-DD)
    const getTodayDateString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Set the minimum date for the dueDateInput to today
    dueDateInput.setAttribute('min', getTodayDateString());
    // Also set the minimum date for the detailDueDate input
    detailDueDate.setAttribute('min', getTodayDateString());

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

    // --- Core UI Update & Interaction Functions (Moved up for definition order) ---

    function updateCalendarViewModeButtons() {
        const isDark = htmlElement.classList.contains('dark');
        [calendarDayBtn, calendarWeekBtn, calendarMonthBtn].forEach(btn => {
            btn.classList.remove('bg-blue-100', 'text-blue-700', 'bg-gray-200', 'text-gray-700', 'hover:bg-gray-300', 'bg-blue-600', 'text-white', 'bg-gray-700', 'hover:bg-gray-600');
            if (isDark) {
                btn.classList.add('bg-gray-700', 'text-gray-200', 'hover:bg-gray-600');
            } else {
                btn.classList.add('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
            }
        });

        if (calendarViewMode === 'day') {
            if (isDark) {
                calendarDayBtn.classList.add('bg-blue-600', 'text-white');
                calendarDayBtn.classList.remove('bg-gray-700', 'text-gray-200', 'hover:bg-gray-600');
            } else {
                calendarDayBtn.classList.add('bg-blue-100', 'text-blue-700');
                calendarDayBtn.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
            }
        } else if (calendarViewMode === 'week') {
            if (isDark) {
                calendarWeekBtn.classList.add('bg-blue-600', 'text-white');
                calendarWeekBtn.classList.remove('bg-gray-700', 'text-gray-200', 'hover:bg-gray-600');
            } else {
                calendarWeekBtn.classList.add('bg-blue-100', 'text-blue-700');
                calendarWeekBtn.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
            }
        } else if (calendarViewMode === 'month') {
            if (isDark) {
                calendarMonthBtn.classList.add('bg-blue-600', 'text-white');
                calendarMonthBtn.classList.remove('bg-gray-700', 'text-gray-200', 'hover:bg-gray-600');
            } else {
                calendarMonthBtn.classList.add('bg-blue-100', 'text-blue-700');
                calendarMonthBtn.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
            }
        }
    }

    function updateSidebarActiveLink() {
        const isDark = htmlElement.classList.contains('dark');

        document.querySelectorAll('aside nav ul li a').forEach(link => {
            // Remove all active/hover/text classes before applying new ones
            link.classList.remove('bg-blue-100', 'text-blue-700', 'font-medium', 'hover:bg-gray-100', 'text-gray-700', 'bg-blue-600', 'text-white', 'hover:bg-zinc-700', 'text-gray-200');
            link.querySelector('span.ml-auto')?.classList.remove('text-blue-700', 'font-bold', 'text-gray-500', 'text-gray-400', 'text-white'); // Remove old count text colors

            // Apply default inactive state styles
            if (isDark) {
                link.classList.add('hover:bg-zinc-700', 'text-gray-200');
                link.querySelector('span.ml-auto')?.classList.add('text-gray-400');
            } else {
                link.classList.add('hover:bg-gray-100', 'text-gray-700');
                link.querySelector('span.ml-auto')?.classList.add('text-gray-500');
            }
        });

        let activeLink = null;
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
        } else if (currentFilter === 'list' && currentFilterList) {
            activeLink = listMenu.querySelector(`[data-list="${currentFilterList}"]`);
        }

        if (activeLink) {
            // Apply active state styles
            activeLink.classList.add('font-medium'); // Always bold for active
            if (isDark) {
                activeLink.classList.add('bg-blue-600', 'text-white');
                activeLink.classList.remove('hover:bg-zinc-700', 'text-gray-200');
                activeLink.querySelector('span.ml-auto')?.classList.add('text-white');
                activeLink.querySelector('span.ml-auto')?.classList.remove('text-gray-400');
            } else {
                activeLink.classList.add('bg-blue-100', 'text-blue-700');
                activeLink.classList.remove('hover:bg-gray-100', 'text-gray-700');
                activeLink.querySelector('span.ml-auto')?.classList.add('text-blue-700', 'font-bold');
                activeLink.querySelector('span.ml-auto')?.classList.remove('text-gray-500');
            }
        }
    }

    function updateSidebarListTheme() {
        const isDark = htmlElement.classList.contains('dark');
        listMenu.querySelectorAll('li a').forEach(link => {
            link.classList.remove('hover:bg-gray-100', 'text-gray-700', 'hover:bg-zinc-700', 'text-gray-200'); // Remove old hover/text
            link.querySelector('.sidebar-list-count')?.classList.remove('text-gray-500', 'text-gray-400'); // Remove old count text colors

            if (isDark) {
                link.classList.add('hover:bg-zinc-700', 'text-gray-200');
                link.querySelector('.sidebar-list-count')?.classList.add('text-gray-400');
            } else {
                link.classList.add('hover:bg-gray-100', 'text-gray-700');
                link.querySelector('.sidebar-list-count')?.classList.add('text-gray-500');
            }
        });
        // Call updateSidebarActiveLink after applying general styles to ensure active state overrides
        updateSidebarActiveLink();
    }

    function showTaskDetails(task, isViewOnly = false) { // MOVED UP
        currentSelectedTask = task;
        detailTaskName.value = task.name;
        detailDescription.value = task.description || '';
        detailList.value = task.list || 'Personal'; // Set the selected list

        // Parse and set separate date and time inputs
        const taskDueDateObj = new Date(task.dueDate);
        const year = taskDueDateObj.getFullYear();
        const month = (taskDueDateObj.getMonth() + 1).toString().padStart(2, '0');
        const day = taskDueDateObj.getDate().toString().padStart(2, '0');
        const hours = taskDueDateObj.getHours().toString().padStart(2, '0');
        const minutes = taskDueDateObj.getMinutes().toString().padStart(2, '0');

        detailDueDate.value = `${year}-${month}-${day}`; // Format for date input
        detailDueTime.value = `${hours}:${minutes}`; // Format for time input

        detailTaskName.readOnly = isViewOnly;
        detailDescription.readOnly = isViewOnly;
        detailList.disabled = isViewOnly;
        detailDueDate.readOnly = isViewOnly;
        detailDueTime.readOnly = isViewOnly; // Make time input readOnly

        detailTagsSection.style.display = isViewOnly ? 'none' : 'block';
        detailSubtasksSection.style.display = isViewOnly ? 'none' : 'block';

        const saveBtn = taskDetailPane.querySelector('.bg-yellow-500');
        const deleteBtn = taskDetailPane.querySelector('.bg-red-500');
        if (saveBtn) saveBtn.style.display = isViewOnly ? 'none' : 'inline-block';
        if (deleteBtn) deleteBtn.style.display = isViewOnly ? 'none' : 'inline-block';

        // Apply theme to detail pane elements
        const isDark = htmlElement.classList.contains('dark');
        taskDetailPane.style.backgroundColor = isDark ? '#2b2c2e' : '#ffffff';
        taskDetailPane.style.boxShadow = isDark ? '-4px 0 6px -1px rgba(0, 0, 0, 0.4), -2px 0 4px -1px rgba(0, 0, 0, 0.24)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        taskDetailPane.querySelector('h2').style.color = isDark ? '#e8eaed' : '#1f2937';
        taskDetailPane.querySelectorAll('label').forEach(label => {
            label.style.color = isDark ? '#bdc1c6' : '#6b7280';
        });
        taskDetailPane.querySelectorAll('input:not([type="checkbox"]), textarea, select').forEach(input => {
            input.style.backgroundColor = isDark ? '#3c4043' : '#ffffff';
            input.style.borderColor = isDark ? '#3c4043' : '#e5e7eb';
            input.style.color = isDark ? '#e8eaed' : '#1f2937';
        });

        taskDetailPane.classList.remove('hidden');
    }

    const saveChangesBtn = taskDetailPane.querySelector('.bg-yellow-500'); // Associated with showTaskDetails
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

            // Combine date and time inputs from detail pane
            const updatedDueDate = detailDueDate.value;
            const updatedDueTime = detailDueTime.value;
            const combinedUpdatedDateTime = `${updatedDueDate}T${updatedDueTime}:00`;

            const updatedTask = {
                name: detailTaskName.value.trim(),
                description: detailDescription.value.trim(),
                list: detailList.value,
                dueDate: combinedUpdatedDateTime,
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
                    const errorData = await response.json();
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.msg || 'Unknown error'}`);
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
                messageBox.textContent = `Failed to save changes: ${error.message || 'Please try again.'}`;
                document.body.appendChild(messageBox);
                setTimeout(() => messageBox.remove(), 3000);
            }
        });
    }

    const deleteTaskBtn = taskDetailPane.querySelector('.bg-red-500'); // Associated with showTaskDetails
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
                <div class="dialog-box p-6 rounded-lg shadow-xl text-center">
                    <p class="dialog-message mb-4 text-lg">Are you sure you want to delete this task?</p>
                    <button id="confirmDeleteYes" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg mr-2">Yes, Delete</button>
                    <button id="confirmDeleteNo" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg">No, Cancel</button>
                </div>
            `;
            document.body.appendChild(confirmDelete);

            document.getElementById('confirmDeleteYes').addEventListener('click', async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}/${currentSelectedTask._id}`, { // Use currentSelectedTask._id
                        method: 'DELETE',
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.msg || 'Unknown error'}`);
                    }

                    const messageBox = document.createElement('div');
                    messageBox.className = 'fixed top-4 right-4 bg-green-500 text-white p-3 rounded-lg shadow-lg';
                    messageBox.textContent = 'Task deleted successfully!';
                    document.body.appendChild(messageBox);
                    setTimeout(() => messageBox.remove(), 3000);

                    confirmDelete.remove();
                    currentSelectedTask = null; // Clear selected task after deletion
                    taskDetailPane.classList.add('hidden'); // Hide detail pane
                    fetchAndRenderTasks(); // Re-fetch and re-render all tasks
                } catch (error) {
                    console.error('Error deleting task:', error);
                    const messageBox = document.createElement('div');
                    messageBox.className = 'fixed top-4 right-4 bg-red-500 text-white p-3 rounded-lg shadow-lg';
                    messageBox.textContent = `Failed to delete task: ${error.message || 'Please try again.'}`;
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

    function renderCurrentView() {
        taskList.classList.add('hidden');
        calendarView.classList.add('hidden');
        stickyWallView.classList.add('hidden');
        taskDetailPane.classList.add('hidden');
        addTaskSection.classList.add('hidden');
        noTasksMessage.classList.add('hidden');

        let tasksToDisplay = [];
        const today = normalizeDate(new Date());

        let todayCount = 0;
        let upcomingCount = 0;
        let completedCount = 0;
        let stickyWallCount = 0;

        const listCounts = {};
        allTasksData.forEach(task => {
            const listName = task.list || 'Personal';
            if (!listCounts[listName]) {
                listCounts[listName] = 0;
            }
            if (!task.completed) {
                listCounts[listName]++;
            }
        });

        // Update counts in sidebar before filtering for current view
        listMenu.querySelectorAll('.sidebar-list-count').forEach(span => {
            const listName = span.closest('a').dataset.list;
            if (listName) {
                span.textContent = listCounts[listName] || 0;
            }
        });


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

        // Reset main header title styling to ensure consistent application of theme
        mainHeaderTitle.className = `text-3xl font-bold ${htmlElement.classList.contains('dark') ? 'text-gray-200' : 'text-gray-800'}`;


        if (currentFilter === 'today') {
            tasksToDisplay = allTasksData.filter(task => normalizeDate(task.dueDate).getTime() === today.getTime() && !task.completed);
            mainHeaderTitle.innerHTML = `Today <span class="text-blue-600 ml-2">${todayCount}</span>`;
            taskList.classList.remove('hidden');
            renderTaskList(tasksToDisplay);
        } else if (currentFilter === 'upcoming') {
            tasksToDisplay = allTasksData.filter(task => normalizeDate(task.dueDate).getTime() > today.getTime() && !task.completed);
            mainHeaderTitle.innerHTML = `Upcoming <span class="text-blue-600 ml-2">${upcomingCount}</span>`;
            taskList.classList.remove('hidden');
            renderTaskList(tasksToDisplay);
        } else if (currentFilter === 'completed') {
            tasksToDisplay = allTasksData.filter(task => task.completed);
            mainHeaderTitle.innerHTML = `Completed <span class="text-blue-600 ml-2">${completedCount}</span>`;
            taskList.classList.remove('hidden');
            renderTaskList(tasksToDisplay);
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
            // Apply theme to add task section
            addTaskSection.style.backgroundColor = htmlElement.classList.contains('dark') ? '#2b2c2e' : '#ffffff';
            addTaskSection.style.boxShadow = htmlElement.classList.contains('dark') ? '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.24)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            addTaskSection.querySelector('h2').style.color = htmlElement.classList.contains('dark') ? '#e8eaed' : '#1f2937';

            addTaskSection.querySelectorAll('input, textarea, select').forEach(input => {
                input.style.backgroundColor = htmlElement.classList.contains('dark') ? '#3c4043' : '#ffffff';
                input.style.borderColor = htmlElement.classList.contains('dark') ? '#3c4043' : '#e5e7eb';
                input.style.color = htmlElement.classList.contains('dark') ? '#e8eaed' : '#1f2937';
                // Need to explicitly set the ring color for dark theme
                input.classList.remove('focus:ring-blue-500'); // Remove default Tailwind
                input.classList.add(htmlElement.classList.contains('dark') ? 'focus:ring-[#8ab4f8]' : 'focus:ring-blue-500');
            });
            addTaskSection.querySelector('#addTaskBtn').style.backgroundColor = htmlElement.classList.contains('dark') ? '#8ab4f8' : '#3b82f6';
            addTaskSection.querySelector('#addTaskBtn').style.color = htmlElement.classList.contains('dark') ? '#202124' : '#ffffff';

        } else if (currentFilter === 'list' && currentFilterList) {
            tasksToDisplay = allTasksData.filter(task => task.list === currentFilterList && !task.completed);
            const listSpecificCount = tasksToDisplay.length;
            mainHeaderTitle.innerHTML = `${currentFilterList} <span class="text-blue-600 ml-2">${listSpecificCount}</span>`;
            taskList.classList.remove('hidden');
            renderTaskList(tasksToDisplay);
        }

        updateSidebarActiveLink();
        updateCalendarViewModeButtons();
        updateSidebarListTheme();
    }

    async function fetchAndRenderTasks() {
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allTasksData = await response.json();
            updateAvailableLists();
            populateListDropdowns();
            renderSidebarLists(); // This calls updateSidebarListTheme, which calls updateSidebarActiveLink
            renderCurrentView(); // This calls updateSidebarActiveLink and updateCalendarViewModeButtons
        } catch (error) {
            console.error('Error fetching tasks:', error);
            taskList.innerHTML = '<p class="text-red-500 text-center">Failed to load tasks. Please ensure the backend is running.</p>';
            noTasksMessage.classList.add('hidden');
            calendarView.classList.add('hidden');
            stickyWallView.classList.add('hidden');
            addTaskSection.classList.remove('hidden');
        }
    }


    function updateAvailableLists() {
        // Collect all unique lists from existing tasks
        allTasksData.forEach(task => {
            if (task.list) {
                availableLists.add(task.list);
            }
        });
        // Sort alphabetically
        availableLists = new Set(Array.from(availableLists).sort((a, b) => {
            // Keep 'Personal' and 'Work' at the top if they exist
            if (a === 'Personal') return -1;
            if (b === 'Personal') return 1;
            if (a === 'Work') return -1;
            if (b === 'Work') return 1;
            return a.localeCompare(b);
        }));
    }

    function populateListDropdowns() {
        const dropdowns = [listInput, detailList];
        dropdowns.forEach(dropdown => {
            dropdown.innerHTML = ''; // Clear existing options
            availableLists.forEach(listName => {
                const option = document.createElement('option');
                option.value = listName;
                option.textContent = listName;
                dropdown.appendChild(option);
            });
        });
    }

    function renderSidebarLists() {
        // Remove existing dynamic list items (keep "Add New List" link)
        const existingListItems = listMenu.querySelectorAll('li:not(:last-child)');
        existingListItems.forEach(item => item.remove());

        const listCounts = {};
        allTasksData.forEach(task => {
            const listName = task.list || 'Personal'; // Default to Personal if not set
            if (!listCounts[listName]) {
                listCounts[listName] = 0;
            }
            if (!task.completed) { // Only count active tasks for sidebar lists
                listCounts[listName]++;
            }
        });

        // Get the 'Add New List' li element
        const addNewListLi = listMenu.querySelector('#addNewListMenuLink').parentNode;

        availableLists.forEach(listName => {
            const listItem = document.createElement('li');
            listItem.className = 'mb-2';
            listItem.innerHTML = `
                <a href="#" class="flex items-center p-2 rounded-lg list-filter-link" data-list="${listName}">
                    <span class="w-3 h-3 ${getListColorClass(listName)} rounded-full mr-2"></span> ${listName} <span
                        class="ml-auto text-sm sidebar-list-count">${listCounts[listName] || 0}</span>
                </a>
            `;
            listMenu.insertBefore(listItem, addNewListLi); // Insert before "Add New List"
        });

        // Add event listeners to newly rendered list links
        listMenu.querySelectorAll('.list-filter-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                currentFilter = 'list';
                currentFilterList = e.target.closest('a').dataset.list;
                renderCurrentView();
            });
        });
        // Apply theme styles to sidebar lists after rendering
        updateSidebarListTheme();
    }

    function getListColorClass(listName) {
        switch (listName.toLowerCase()) {
            case 'personal': return 'bg-red-500';
            case 'work': return 'bg-blue-500';
            case 'groceries': return 'bg-green-500';
            case 'home': return 'bg-purple-500';
            default: return 'bg-gray-400';
        }
    }


    function renderTaskList(tasksToDisplay) {
        taskList.innerHTML = '';
        noTasksMessage.classList.add('hidden');

        if (tasksToDisplay.length === 0) {
            noTasksMessage.classList.remove('hidden');
            // Adjust no tasks message color based on theme
            noTasksMessage.classList.add(htmlElement.classList.contains('dark') ? 'text-gray-400' : 'text-gray-500');
            noTasksMessage.classList.remove('hidden');
            return;
        }

        // Group tasks by list first, then by date within each list
        const groupedByList = {};
        tasksToDisplay.forEach(task => {
            const listName = task.list || 'Uncategorized'; // Default to 'Uncategorized' if no list
            if (!groupedByList[listName]) {
                groupedByList[listName] = [];
            }
            groupedByList[listName].push(task);
        });

        for (const listName in groupedByList) {
            const listSectionHeader = document.createElement('h2');
            listSectionHeader.className = `text-xl font-semibold mt-6 mb-3 border-b pb-2 ${htmlElement.classList.contains('dark') ? 'text-gray-200 border-gray-700' : 'text-gray-700 border-gray-300'}`;
            listSectionHeader.textContent = listName;
            taskList.appendChild(listSectionHeader);

            const tasksInList = groupedByList[listName].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

            const groupedTasksByDate = {}; // Group tasks by date within the current list
            tasksInList.forEach(task => {
                const date = new Date(task.dueDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                if (!groupedTasksByDate[date]) {
                    groupedTasksByDate[date] = [];
                }
                groupedTasksByDate[date].push(task);
            });

            for (const date in groupedTasksByDate) {
                const dateHeading = document.createElement('h3'); // Changed to h3 for sub-grouping
                dateHeading.className = `text-lg font-medium mt-4 mb-2 ${htmlElement.classList.contains('dark') ? 'text-gray-300' : 'text-gray-600'}`;
                dateHeading.textContent = date;
                taskList.appendChild(dateHeading);

                groupedTasksByDate[date].forEach(task => {
                    const taskItem = document.createElement('div');
                    const taskItemBgClass = htmlElement.classList.contains('dark') ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700' : 'bg-white hover:bg-gray-50 border-gray-200';
                    const taskContentColorClass = task.completed ? (htmlElement.classList.contains('dark') ? 'text-gray-500' : 'text-gray-500') : (htmlElement.classList.contains('dark') ? 'text-gray-100' : 'text-gray-800');
                    const taskDateColorClass = task.completed ? (htmlElement.classList.contains('dark') ? 'text-gray-600' : 'text-gray-400') : (htmlElement.classList.contains('dark') ? 'text-gray-400' : 'text-gray-500');

                    taskItem.className = `task-item flex items-center justify-between p-4 rounded-lg shadow-sm cursor-pointer ${taskItemBgClass}`;
                    taskItem.dataset.id = task._id;
                    taskItem.dataset.completed = task.completed;

                    const dueDateObj = new Date(task.dueDate);
                    const formattedTime = dueDateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });


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
                        <div class="task-content flex-grow ${task.completed ? 'line-through' : ''}">
                            <p class="${taskContentColorClass} font-medium">${task.name}</p>
                            <p class="text-sm ${taskDateColorClass}">Due: ${dueDateObj.toLocaleDateString()} at ${formattedTime}</p>
                            ${task.list ? `<p class="text-xs ${taskDateColorClass}">List: ${task.list}</p>` : ''}
                        </div>
                        ${menuButtonsHtml}
                    `;

                    // FIX: Event listeners are attached here
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
    }


    function renderCalendarView(allTasks, mode) {
        const timeColumn = calendarView.querySelector('.time-column');
        timeColumn.innerHTML = '';
        calendarDaysContainer.innerHTML = '';

        // Apply theme colors to calendar elements
        const isDark = htmlElement.classList.contains('dark');
        calendarView.style.backgroundColor = isDark ? '#2b2c2e' : '#ffffff';
        calendarView.style.boxShadow = isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.24)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        calendarView.querySelector('.calendar-grid-container').style.backgroundColor = isDark ? '#202124' : '#ffffff';
        calendarView.querySelector('.calendar-grid-container').style.borderColor = isDark ? '#3c4043' : '#e0e0e0';

        timeColumn.style.backgroundColor = isDark ? '#2b2c2e' : '#fcfcfc';
        timeColumn.style.borderRightColor = isDark ? '#3c4043' : '#eee';


        for (let h = 0; h < 24; h++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.textContent = `${h === 0 ? 12 : (h > 12 ? h - 12 : h)}${h < 12 ? ' AM' : ' PM'}`;
            timeSlot.style.color = isDark ? '#9aa0a6' : '#a0a0a0';
            timeSlot.style.borderBottomColor = isDark ? '#2b2c2e' : '#f5f5f5';
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

            // Calculate start of the week for the first day of the month to fill the grid
            const firstDayOfMonth = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), 1);
            const startDayOfWeek = new Date(firstDayOfMonth);
            startDayOfWeek.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay()); // Sunday of the first week

            for (let i = 0; i < 42; i++) { // Max 6 weeks * 7 days
                const day = new Date(startDayOfWeek);
                day.setDate(startDayOfWeek.getDate() + i);
                daysToDisplay.push(day);
            }
            headerText = currentCalendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }

        currentPeriodRange.textContent = headerText;
        currentPeriodRange.style.color = isDark ? '#e8eaed' : '#202124'; // Apply color to range text

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        daysToDisplay.forEach((dayDate, index) => {
            const normalizedDay = normalizeDate(dayDate);
            const dayColumn = document.createElement('div');
            dayColumn.className = 'calendar-day-column';
            dayColumn.style.borderRightColor = isDark ? '#3c4043' : '#eee';

            const dayHeader = document.createElement('div');
            dayHeader.className = `day-header ${normalizedDay.getTime() === today.getTime() ? 'current-day-header' : ''}`;
            dayHeader.style.backgroundColor = isDark ? '#2b2c2e' : '#fdfdfd';
            dayHeader.style.borderBottomColor = isDark ? '#3c4043' : '#e0e0e0';
            dayHeader.style.color = isDark ? '#bdc1c6' : '#5f6368'; // Day name color

            dayHeader.innerHTML = `<span class="day-name">${dayNames[dayDate.getDay()]}</span><span class="day-number">${dayDate.getDate()}</span>`;
            dayColumn.appendChild(dayHeader);

            const dayNumberSpan = dayHeader.querySelector('.day-number');
            if (normalizedDay.getTime() === today.getTime()) {
                dayNumberSpan.style.backgroundColor = isDark ? '#8ab4f8' : '#4285F4'; // Active day circle background
                dayNumberSpan.style.color = isDark ? '#202124' : 'white'; // Active day circle text
            } else {
                dayNumberSpan.style.color = isDark ? '#e8eaed' : '#202124'; // Non-active day circle text
                dayNumberSpan.style.backgroundColor = 'transparent'; // Ensure no background for non-active
            }

            // Dim out days not in the current month for month view
            if (mode === 'month' && dayDate.getMonth() !== currentCalendarDate.getMonth()) {
                dayHeader.style.opacity = '0.5';
                dayColumn.style.opacity = '0.5';
            }


            for (let h = 0; h < 24; h++) {
                const dayGridSlot = document.createElement('div');
                dayGridSlot.className = 'day-grid-slot';
                dayGridSlot.dataset.date = normalizedDay.toISOString().split('T')[0];
                dayGridSlot.dataset.hour = h;
                dayGridSlot.style.borderBottomColor = isDark ? '#2b2c2e' : '#f5f5f5'; // Grid line color
                dayColumn.appendChild(dayGridSlot);
            }
            calendarDaysContainer.appendChild(dayColumn);
        });

        // Apply theme to calendar buttons
        calendarView.querySelectorAll('button').forEach(btn => {
            if (btn.id !== 'calendarDayBtn' && btn.id !== 'calendarWeekBtn' && btn.id !== 'calendarMonthBtn') {
                btn.style.backgroundColor = isDark ? '#3c4043' : '#e2e2e2';
                btn.style.color = isDark ? '#e8eaed' : '#6b7280';
                btn.classList.remove('hover:bg-gray-300'); // Remove light mode hover
                btn.classList.add('hover:bg-5f6368'); // Add dark mode hover
            }
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
                    taskEvent.style.backgroundColor = calendarEventColor; // Still light blue for visibility

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
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.msg || 'Unknown error'}`);
            }

            const messageBox = document.createElement('div');
            messageBox.className = 'fixed top-4 right-4 bg-green-500 text-white p-3 rounded-lg shadow-lg';
            document.body.appendChild(messageBox);
            messageBox.textContent = `Task marked as ${!currentStatus ? 'done' : 'undone'}!`;
            setTimeout(() => messageBox.remove(), 3000);

            fetchAndRenderTasks();
        } catch (error) {
            console.error('Error toggling task completion:', error);
            const messageBox = document.createElement('div');
            messageBox.className = 'fixed top-4 right-4 bg-red-500 text-white p-3 rounded-lg shadow-lg';
            messageBox.textContent = `Failed to update task status: ${error.message || 'Please try again.'}`;
            document.body.appendChild(messageBox);
            setTimeout(() => messageBox.remove(), 3000);
        }
    }

    async function deleteTask(taskId) {
        const confirmDelete = document.createElement('div');
        confirmDelete.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        confirmDelete.innerHTML = `
            <div class="dialog-box p-6 rounded-lg shadow-xl text-center">
                <p class="dialog-message mb-4 text-lg">Are you sure you want to delete this task?</p>
                <button id="confirmDeleteYes" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg mr-2">Yes, Delete</button>
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
                    const errorData = await response.json();
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.msg || 'Unknown error'}`);
                }

                const messageBox = document.createElement('div');
                messageBox.className = 'fixed top-4 right-4 bg-green-500 text-white p-3 rounded-lg shadow-lg';
                messageBox.textContent = 'Task deleted successfully!';
                document.body.appendChild(messageBox);
                setTimeout(() => messageBox.remove(), 3000);

                confirmDelete.remove();
                currentSelectedTask = null; // Clear selected task after deletion
                taskDetailPane.classList.add('hidden'); // Hide detail pane
                fetchAndRenderTasks(); // Re-fetch and re-render all tasks
            } catch (error) {
                console.error('Error deleting task:', error);
                const messageBox = document.createElement('div');
                messageBox.className = 'fixed top-4 right-4 bg-red-500 text-white p-3 rounded-lg shadow-lg';
                messageBox.textContent = `Failed to delete task: ${error.message || 'Please try again.'}`;
                document.body.appendChild(messageBox);
                setTimeout(() => messageBox.remove(), 3000);
                confirmDelete.remove();
            }
        });

        document.getElementById('confirmDeleteNo').addEventListener('click', () => {
            confirmDelete.remove();
        });
    }

    // --- Event Listeners for Sidebar Navigation ---
    upcomingTasksLink.addEventListener('click', (e) => {
        e.preventDefault();
        currentFilter = 'upcoming';
        currentFilterList = null; // Clear list filter when switching main views
        renderCurrentView();
    });

    todayTasksLink.addEventListener('click', (e) => {
        e.preventDefault();
        currentFilter = 'today';
        currentFilterList = null; // Clear list filter when switching main views
        renderCurrentView();
    });

    completedTasksLink.addEventListener('click', (e) => {
        e.preventDefault();
        currentFilter = 'completed';
        currentFilterList = null; // Clear list filter when switching main views
        renderCurrentView();
    });

    calendarLink.addEventListener('click', (e) => {
        e.preventDefault();
        currentFilter = 'calendar';
        currentFilterList = null; // Clear list filter when switching main views
        currentCalendarDate = new Date(); // Reset calendar view to current date on click
        renderCurrentView();
    });

    stickyWallLink.addEventListener('click', (e) => {
        e.preventDefault();
        currentFilter = 'stickywall';
        currentFilterList = null; // Clear list filter when switching main views
        renderCurrentView(); // `renderCurrentView` will call `renderStickyWallView`
    });

    addTaskMenuLink.addEventListener('click', (e) => {
        e.preventDefault();
        currentFilter = 'addTask';
        currentFilterList = null; // Clear list filter when switching main views
        renderCurrentView();
    });

    // --- Calendar Navigation Event Listeners ---
    prevPeriodBtn.addEventListener('click', () => {
        if (currentFilter !== 'calendar') return; // Only allow navigation if calendar is active
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
        if (currentFilter !== 'calendar') return; // Only allow navigation if calendar is active
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
        currentCalendarDate = new Date(); // Reset to current day
        renderCurrentView();
    });

    calendarWeekBtn.addEventListener('click', () => {
        calendarViewMode = 'week';
        currentCalendarDate = new Date(); // Reset to current week
        renderCurrentView();
    });

    calendarMonthBtn.addEventListener('click', () => {
        calendarViewMode = 'month';
        currentCalendarDate = new Date(); // Reset to current month
        renderCurrentView();
    });

    // Event listener for adding a new task
    addTaskBtn.addEventListener('click', async () => {
        const taskName = taskInput.value.trim();
        const taskDescription = taskDescriptionInput.value.trim();
        const dueDate = dueDateInput.value; // ISO-MM-DD
        const dueTime = dueTimeInput.value; // HH:MM
        const list = listInput.value;

        // Validation: ensure required fields are not empty
        if (!taskName || !dueDate || !dueTime) {
            const messageBox = document.createElement('div');
            messageBox.className = 'fixed top-4 right-4 bg-yellow-500 text-white p-3 rounded-lg shadow-lg';
            messageBox.textContent = 'Please enter task name, date, and time.';
            document.body.appendChild(messageBox);
            setTimeout(() => messageBox.remove(), 3000);
            return; // Stop execution if validation fails
        }

        // Combine date and time into a single ISO 8601 string for the backend
        // Appending ':00' for seconds as Date constructor might expect it or it's good practice.
        const combinedDateTime = `${dueDate}T${dueTime}:00`;

        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: taskName, description: taskDescription, dueDate: combinedDateTime, list: list }),
            });

            if (!response.ok) {
                // If response is not OK, try to read the error message from backend
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.msg || 'Unknown error'}`);
            }

            // Clear inputs on success
            taskInput.value = '';
            taskDescriptionInput.value = '';
            dueDateInput.value = '';
            dueTimeInput.value = '';
            // listInput.value will default to the first option if not explicitly set

            // Re-fetch and render tasks to update the UI
            fetchAndRenderTasks();

            // Show success message
            const messageBox = document.createElement('div');
            messageBox.className = 'fixed top-4 right-4 bg-green-500 text-white p-3 rounded-lg shadow-lg';
            messageBox.textContent = 'Task added successfully!';
            document.body.appendChild(messageBox);
            setTimeout(() => messageBox.remove(), 3000);

        } catch (error) {
            console.error('Error adding task:', error);
            const messageBox = document.createElement('div');
            messageBox.className = 'fixed top-4 right-4 bg-red-500 text-white p-3 rounded-lg shadow-lg';
            messageBox.textContent = `Failed to add task: ${error.message || 'Please ensure the backend is running and data is valid.'}`;
            document.body.appendChild(messageBox);
            setTimeout(() => messageBox.remove(), 5000); // Give more time for error messages
        }
    });

    // Event listener for adding a new list from the sidebar menu
    addNewListMenuLink.addEventListener('click', (e) => {
        e.preventDefault();
        const newList = prompt("Enter the name for the new list:");
        if (newList && newList.trim() !== '') {
            const trimmedList = newList.trim();
            if (!availableLists.has(trimmedList)) {
                availableLists.add(trimmedList);
                availableLists = new Set(Array.from(availableLists).sort((a, b) => {
                    if (a === 'Personal') return -1;
                    if (b === 'Personal') return 1;
                    if (a === 'Work') return -1;
                    if (b === 'Work') return 1;
                    return a.localeCompare(b);
                }));
                populateListDropdowns();
                renderSidebarLists();
                const messageBox = document.createElement('div');
                messageBox.className = 'fixed top-4 right-4 bg-green-500 text-white p-3 rounded-lg shadow-lg';
                messageBox.textContent = `List "${trimmedList}" added!`;
                document.body.appendChild(messageBox);
                setTimeout(() => messageBox.remove(), 3000);
            } else {
                const messageBox = document.createElement('div');
                messageBox.className = 'fixed top-4 right-4 bg-yellow-500 text-white p-3 rounded-lg shadow-lg';
                messageBox.textContent = `List "${trimmedList}" already exists.`;
                document.body.appendChild(messageBox);
                setTimeout(() => messageBox.remove(), 3000);
            }
        }
    });

    // Initial fetch and render when the page loads
    fetchAndRenderTasks();
});