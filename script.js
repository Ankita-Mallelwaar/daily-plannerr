/* =========================
   DATA
========================= */

let tasks = JSON.parse(localStorage.getItem("planner_tasks")) || [];
let lectures = JSON.parse(localStorage.getItem("planner_lectures")) || [];
let exams = JSON.parse(localStorage.getItem("planner_exams")) || [];

let streak = Number(localStorage.getItem("planner_streak")) || 0;
let lastCompletedDate = localStorage.getItem("planner_last_completed") || "";


/* =========================
   DATE FUNCTIONS
========================= */

function getToday() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getDayName() {

    return new Intl.DateTimeFormat("en-US", {
        weekday: "long"
    }).format(new Date());

}

function formatDate(dateString) {

    if (!dateString) return "";

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

}


/* =========================
   HEADER DATE
========================= */

document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });


/* =========================
   SAVE DATA
========================= */

function saveData() {

    localStorage.setItem(
        "planner_tasks",
        JSON.stringify(tasks)
    );

    localStorage.setItem(
        "planner_lectures",
        JSON.stringify(lectures)
    );

    localStorage.setItem(
        "planner_exams",
        JSON.stringify(exams)
    );

    localStorage.setItem(
        "planner_streak",
        streak
    );

    localStorage.setItem(
        "planner_last_completed",
        lastCompletedDate
    );

}


/* =========================
   NAVIGATION
========================= */

document.querySelectorAll(".nav-btn").forEach(button => {

    button.addEventListener("click", () => {

        const page = button.dataset.page;

        document.querySelectorAll(".page").forEach(p => {
            p.classList.remove("active");
        });

        document.getElementById(page).classList.add("active");

        document.querySelectorAll(".nav-btn").forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        renderAll();

    });

});


/* =========================
   MODALS
========================= */

function openModal(id) {
    document.getElementById(id).classList.add("show");
}

function closeModal(id) {
    document.getElementById(id).classList.remove("show");
}

document.querySelectorAll("[data-close]").forEach(button => {

    button.addEventListener("click", () => {
        closeModal(button.dataset.close);
    });

});

window.addEventListener("click", event => {

    if (event.target.classList.contains("modal")) {
        event.target.classList.remove("show");
    }

});


/* =========================
   ADD TASK
========================= */

document.getElementById("addTaskBtn").addEventListener("click", () => {

    document.getElementById("taskDate").value = getToday();

    openModal("taskModal");

});


document.getElementById("taskForm").addEventListener("submit", event => {

    event.preventDefault();

    const task = {

        id: Date.now(),

        name: document.getElementById("taskName").value.trim(),

        subject: document.getElementById("taskSubject").value.trim(),

        category: document.getElementById("taskCategory").value,

        date: document.getElementById("taskDate").value,

        priority: document.getElementById("taskPriority").value,

        completed: false

    };

    tasks.push(task);

    saveData();

    event.target.reset();

    closeModal("taskModal");

    renderAll();

});


/* =========================
   COMPLETE TASK
========================= */

function toggleTask(id) {

    const task = tasks.find(t => t.id === id);

    if (!task) return;

    task.completed = !task.completed;

    updateStreak();

    saveData();

    renderAll();

}


/* =========================
   DELETE TASK
========================= */

function deleteTask(id) {

    tasks = tasks.filter(task => task.id !== id);

    saveData();

    renderAll();

}


/* =========================
   TASK HTML
========================= */

function taskHTML(task) {

    return `
        <div class="task ${task.completed ? "completed" : ""}">

            <div
                class="check"
                onclick="toggleTask(${task.id})">
            </div>

            <div class="task-info">

                <div class="task-name">
                    ${escapeHTML(task.name)}
                </div>

                <div class="task-meta">

                    ${task.subject
                        ? `<span class="badge">📚 ${escapeHTML(task.subject)}</span>`
                        : ""
                    }

                    <span class="badge">
                        ${escapeHTML(task.category)}
                    </span>

                    <span class="badge priority-${task.priority.toLowerCase()}">
                        ${escapeHTML(task.priority)}
                    </span>

                    <span class="badge">
                        📅 ${formatDate(task.date)}
                    </span>

                </div>

            </div>

            <button
                class="delete-btn"
                onclick="deleteTask(${task.id})">
                ×
            </button>

        </div>
    `;

}


/* =========================
   RENDER TASKS
========================= */

function renderTasks() {

    const today = getToday();

    const todayTasks =
        tasks.filter(task => task.date === today);

    const allTasksContainer =
        document.getElementById("allTasks");

    const todayContainer =
        document.getElementById("todayTasks");

    if (tasks.length === 0) {

        allTasksContainer.innerHTML = `
            <div class="empty">
                <div class="empty-icon">📝</div>
                <p>No tasks yet.</p>
                <p>Add your first task using +</p>
            </div>
        `;

    } else {

        allTasksContainer.innerHTML =
            tasks
            .sort((a,b) => a.date.localeCompare(b.date))
            .map(taskHTML)
            .join("");

    }


    if (todayTasks.length === 0) {

        todayContainer.innerHTML = `
            <div class="empty">
                <div class="empty-icon">🎉</div>
                <p>No tasks for today.</p>
            </div>
        `;

    } else {

        todayContainer.innerHTML =
            todayTasks.map(taskHTML).join("");

    }

}


/* =========================
   PROGRESS
========================= */

function renderProgress() {

    const today = getToday();

    const todayTasks =
        tasks.filter(task => task.date === today);

    const completed =
        todayTasks.filter(task => task.completed).length;

    const total = todayTasks.length;

    const percent =
        total === 0
        ? 0
        : Math.round((completed / total) * 100);

    document.getElementById("todayTaskCount").textContent = total;

    document.getElementById("completedCount").textContent =
        completed;

    document.getElementById("todayProgress").textContent =
        percent + "%";

    document.getElementById("progressText").textContent =
        `${completed} / ${total}`;

    document.getElementById("progressBar").style.width =
        percent + "%";

    document.getElementById("streakCount").textContent =
        `${streak} day${streak === 1 ? "" : "s"}`;

}


/* =========================
   STREAK
========================= */

function updateStreak() {

    const today = getToday();

    const todayTasks =
        tasks.filter(task => task.date === today);

    if (todayTasks.length === 0) return;

    const allDone =
        todayTasks.every(task => task.completed);

    if (!allDone) return;

    if (lastCompletedDate === today) {
        return;
    }

    const yesterdayDate =
        new Date();

    yesterdayDate.setDate(
        yesterdayDate.getDate() - 1
    );

    const yesterday =
        yesterdayDate.toISOString().split("T")[0];

    if (lastCompletedDate === yesterday) {

        streak++;

    } else {

        streak = 1;

    }

    lastCompletedDate = today;

    saveData();

}


/* =========================
   ADD LECTURE
========================= */

document.getElementById("addLectureBtn").addEventListener(
    "click",
    () => openModal("lectureModal")
);


document.getElementById("lectureForm").addEventListener(
    "submit",
    event => {

        event.preventDefault();

        const lecture = {

            id: Date.now(),

            subject:
                document.getElementById("lectureSubject").value.trim(),

            day:
                document.getElementById("lectureDay").value,

            time:
                document.getElementById("lectureTime").value

        };

        lectures.push(lecture);

        saveData();

        event.target.reset();

        closeModal("lectureModal");

        renderAll();

    }
);


/* =========================
   DELETE LECTURE
========================= */

function deleteLecture(id) {

    lectures =
        lectures.filter(lecture => lecture.id !== id);

    saveData();

    renderAll();

}


/* =========================
   RENDER TIMETABLE
========================= */

function renderTimetable() {

    const container =
        document.getElementById("timetableList");

    if (lectures.length === 0) {

        container.innerHTML = `
            <div class="empty">
                <div class="empty-icon">🏫</div>
                <p>No lectures added.</p>
            </div>
        `;

        return;
    }

    const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ];

    let html = "";

    days.forEach(day => {

        const dayLectures =
            lectures
            .filter(l => l.day === day)
            .sort((a,b) => a.time.localeCompare(b.time));

        if (dayLectures.length === 0) return;

        html += `
            <h3 style="margin:18px 0 4px;">
                ${day}
            </h3>
        `;

        dayLectures.forEach(lecture => {

            html += `
                <div class="schedule-item">

                    <div class="schedule-time">
                        ${lecture.time}
                    </div>

                    <div class="schedule-info">

                        <div class="schedule-subject">
                            ${escapeHTML(lecture.subject)}
                        </div>

                        <div class="schedule-type">
                            College Lecture
                        </div>

                    </div>

                    <button
                        class="delete-btn"
                        onclick="deleteLecture(${lecture.id})">
                        ×
                    </button>

                </div>
            `;

        });

    });

    container.innerHTML = html;

}


/* =========================
   TODAY'S SCHEDULE
========================= */

function renderTodaySchedule() {

    const container =
        document.getElementById("todaySchedule");

    const day =
        getDayName();

    const todayLectures =
        lectures
        .filter(l => l.day === day)
        .sort((a,b) => a.time.localeCompare(b.time));

    if (todayLectures.length === 0) {

        container.innerHTML = `
            <div class="empty">
                <div class="empty-icon">🏫</div>
                <p>No lectures scheduled today.</p>
            </div>
        `;

        return;

    }

    container.innerHTML =
        todayLectures.map(lecture => {

            return `
                <div class="schedule-item">

                    <div class="schedule-time">
                        ${lecture.time}
                    </div>

                    <div class="schedule-info">

                        <div class="schedule-subject">
                            ${escapeHTML(lecture.subject)}
                        </div>

                        <div class="schedule-type">
                            Lecture
                        </div>

                    </div>

                </div>
            `;

        }).join("");

}


/* =========================
   ADD EXAM
========================= */

document.getElementById("addExamBtn").addEventListener(
    "click",
    () => {

        document.getElementById("examDate").value = getToday();

        openModal("examModal");

    }
);


document.getElementById("examForm").addEventListener(
    "submit",
    event => {

        event.preventDefault();

        const exam = {

            id: Date.now(),

            subject:
                document.getElementById("examSubject").value.trim(),

            date:
                document.getElementById("examDate").value,

            time:
                document.getElementById("examTime").value,

            type:
                document.getElementById("examType").value

        };

        exams.push(exam);

        saveData();

        event.target.reset();

        closeModal("examModal");

        renderAll();

    }
);


/* =========================
   DELETE EXAM
========================= */

function deleteExam(id) {

    exams =
        exams.filter(exam => exam.id !== id);

    saveData();

    renderAll();

}


/* =========================
   RENDER EXAMS
========================= */

function renderExams() {

    const container =
        document.getElementById("examList");

    if (exams.length === 0) {

        container.innerHTML = `
            <div class="card empty">
                <div class="empty-icon">📝</div>
                <p>No tests or exams added.</p>
            </div>
        `;

        return;

    }

    const sorted =
        [...exams].sort(
            (a,b) => a.date.localeCompare(b.date)
        );

    container.innerHTML =
        sorted.map(exam => {

            return `
                <div class="card exam-card">

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        gap:10px;
                    ">

                        <div>

                            <div class="exam-date">
                                ${formatDate(exam.date)}
                                ${exam.time ? " • " + exam.time : ""}
                            </div>

                            <h3 style="margin-top:6px;">
                                ${escapeHTML(exam.subject)}
                            </h3>

                            <div class="task-meta">
                                <span class="badge">
                                    ${escapeHTML(exam.type)}
                                </span>
                            </div>

                        </div>

                        <button
                            class="delete-btn"
                            onclick="deleteExam(${exam.id})">
                            ×
                        </button>

                    </div>

                </div>
            `;

        }).join("");

}


/* =========================
   SECURITY
========================= */

function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================
   SETTINGS
========================= */

document.getElementById("settingsBtn").addEventListener(
    "click",
    () => {

        alert(
            "Daily Planner\n\n" +
            "Your data is stored locally in this browser.\n\n" +
            "No account or server is required for this version."
        );

    }
);


/* =========================
   RENDER EVERYTHING
========================= */

function renderAll() {

    renderTasks();

    renderProgress();

    renderTimetable();

    renderTodaySchedule();

    renderExams();

}


/* =========================
   START APP
========================= */

renderAll();
