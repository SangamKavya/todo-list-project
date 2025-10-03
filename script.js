const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const clearBtn = document.getElementById('clearBtn');
const taskCounter = document.getElementById('taskCounter');
const addTaskBtn = document.getElementById('addTaskBtn');
const modal = document.getElementById('taskModal');
const modalInput = document.getElementById('modalTaskInput');
const saveTaskBtn = document.getElementById('saveTaskBtn');
const filterBtns = document.querySelectorAll('.filter-btn');

let editingTaskId = null;
let currentFilter = 'all';

// Load tasks on page load
window.onload = () => {
  loadTasks();
  updateCounter();
};

// Modal logic
addTaskBtn.onclick = () => openModal();
function openModal(editId = null, editText = null) {
  modal.classList.add('show');
  modalInput.value = editText || '';
  modalInput.focus();
  editingTaskId = editId;
  document.getElementById('modalTitle').textContent = editId ? 'Edit Task' : 'Add New Task';
}
function closeModal() {
  modal.classList.remove('show');
  modalInput.value = '';
  editingTaskId = null;
}
window.onclick = function(event) {
  if (event.target === modal) closeModal();
};

// Save/Add/Edit Task
saveTaskBtn.onclick = saveTask;
modalInput.addEventListener('keypress', function(event) {
  if (event.key === 'Enter') saveTask();
});
function saveTask() {
  const text = modalInput.value.trim();
  if (!text) return;
  if (editingTaskId) {
    updateTaskText(editingTaskId, text);
    closeModal();
    loadTasks();
  } else {
    addTask(text);
    closeModal();
  }
}

// Add new task with unique id
function addTask(text) {
  const task = { id: Date.now(), text, completed: false };
  let tasks = getTasks();
  tasks.push(task);
  setTasks(tasks);
  loadTasks();
  updateCounter();
}

// Render tasks with filter
function loadTasks() {
  taskList.innerHTML = '';
  let tasks = getTasks();
  if (currentFilter === 'completed') tasks = tasks.filter(t => t.completed);
  if (currentFilter === 'pending') tasks = tasks.filter(t => !t.completed);
  tasks.forEach(task => renderTask(task));
  updateCounter();
}

// Render single task
function renderTask(task) {
  const li = document.createElement('li');
  const leftDiv = document.createElement('div');
  leftDiv.className = 'task-left';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.onclick = () => {
    updateTaskStatus(task.id, checkbox.checked);
    loadTasks();
  };

  const taskSpan = document.createElement('span');
  taskSpan.textContent = task.text;
  if (task.completed) taskSpan.classList.add('completed');

  leftDiv.appendChild(checkbox);
  leftDiv.appendChild(taskSpan);

  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'actions';

  const editBtn = document.createElement('button');
  editBtn.textContent = '✏️ Edit';
  editBtn.className = 'edit-btn';
  editBtn.onclick = () => openModal(task.id, task.text);

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '🗑️ Delete';
  deleteBtn.className = 'delete-btn';
  deleteBtn.onclick = () => {
    li.classList.add('remove');
    setTimeout(() => {
      deleteTask(task.id);
      loadTasks();
    }, 300);
  };

  actionsDiv.appendChild(editBtn);
  actionsDiv.appendChild(deleteBtn);

  li.appendChild(leftDiv);
  li.appendChild(actionsDiv);
  taskList.appendChild(li);

  setTimeout(() => li.classList.add('show'), 50);
}

// Local Storage helpers
function getTasks() {
  return JSON.parse(localStorage.getItem('tasks')) || [];
}
function setTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}
function updateTaskStatus(id, completed) {
  let tasks = getTasks();
  tasks = tasks.map(t => t.id === id ? { ...t, completed } : t);
  setTasks(tasks);
}
function updateTaskText(id, newText) {
  let tasks = getTasks();
  tasks = tasks.map(t => t.id === id ? { ...t, text: newText } : t);
  setTasks(tasks);
}
function deleteTask(id) {
  let tasks = getTasks();
  tasks = tasks.filter(t => t.id !== id);
  setTasks(tasks);
}

// Clear All
clearBtn.onclick = () => {
  if (confirm('Are you sure you want to delete all tasks?')) {
    localStorage.removeItem('tasks');
    loadTasks();
    updateCounter();
  }
};

// Task Counter
function updateCounter() {
  const tasks = getTasks();
  const completed = tasks.filter(t => t.completed).length;
  taskCounter.textContent = `Total Tasks: ${tasks.length} | Completed: ${completed}`;
}

// Filter Buttons
filterBtns.forEach(btn => {
  btn.onclick = function() {
    filterBtns.forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    currentFilter = this.textContent.toLowerCase();
    loadTasks();
  };
});
