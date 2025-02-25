<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { taskManager } from '@/utils/tasks';

const props = defineProps({
  day: {
    type: Object,
    required: true
  }
});

const tasks = ref([]);
const newTaskTitle = ref('');
const newTaskDescription = ref('');
const error = ref('');
const editingTask = ref(null);
const searchQuery = ref('')
const draggedItem = ref(null)
const dragOverItem = ref(null)

// Filter tasks based on search query
const filteredTasks = computed(() => {
  if (!searchQuery.value) return tasks.value;

  const query = searchQuery.value.toLowerCase();
  return tasks.value.filter(task =>
    task.title.toLowerCase().includes(query) ||
    (task.description && task.description.toLowerCase().includes(query))
  );
});

// Group tasks by completion status
const groupedTasks = computed(() => {
  const incomplete = filteredTasks.value.filter(task => !task.completed);
  const completed = filteredTasks.value.filter(task => task.completed);
  return { incomplete, completed };
});

const loadTasks = async () => {
  try {
    const dayTasks = await taskManager.getTasks(props.day.name);
    tasks.value = dayTasks;
  } catch (err) {
    error.value = 'Failed to load tasks';
    console.error(err);
  }
};

const addTask = async () => {
  if (!newTaskTitle.value.trim()) return;

  try {
    await taskManager.addTask(props.day.name, {
      title: newTaskTitle.value,
      description: newTaskDescription.value
    });
    newTaskTitle.value = '';
    newTaskDescription.value = '';
    await loadTasks();
  } catch (err) {
    error.value = 'Failed to add task';
    console.error(err);
  }
};

const toggleTask = async (taskId) => {
  try {
    await taskManager.toggleTask(props.day.name, taskId);
    await loadTasks();
  } catch (err) {
    error.value = 'Failed to update task';
    console.error(err);
  }
};

const startEditing = (task) => {
  editingTask.value = {
    ...task,
    newTitle: task.title,
    newDescription: task.description
  };
};

const saveEdit = async () => {
  if (!editingTask.value) return;

  try {
    await taskManager.updateTask(props.day.name, editingTask.value.id, {
      title: editingTask.value.newTitle,
      description: editingTask.value.newDescription
    });
    editingTask.value = null;
    await loadTasks();
  } catch (err) {
    error.value = 'Failed to update task';
    console.error(err);
  }
};

const deleteTask = async (taskId) => {
  try {
    await taskManager.deleteTask(props.day.name, taskId);
    await loadTasks();
  } catch (err) {
    error.value = 'Failed to delete task';
    console.error(err);
  }
};

const handleDragStart = (event, task, index, isCompleted) => {
  draggedItem.value = { task, index, isCompleted }
  event.target.classList.add('dragging')
}

const handleDragEnd = (event) => {
  event.target.classList.remove('dragging')
  draggedItem.value = null
  dragOverItem.value = null
}

const handleDragOver = (event, index, isCompleted) => {
  event.preventDefault()
  dragOverItem.value = { index, isCompleted }

  // Remove drag-over class from all items
  document.querySelectorAll('.task-list li').forEach(item => {
    item.classList.remove('drag-over')
  })

  // Add drag-over class to current target
  event.target.closest('li').classList.add('drag-over')
}

const handleDrop = async (event, toIndex, isCompleted) => {
  event.preventDefault()
  if (!draggedItem.value) return

  const { index: fromIndex, isCompleted: fromCompleted } = draggedItem.value

  try {
    const sourceList = fromCompleted ? groupedTasks.value.completed : groupedTasks.value.incomplete
    const targetList = isCompleted ? groupedTasks.value.completed : groupedTasks.value.incomplete

    const [movedTask] = sourceList.splice(fromIndex, 1)
    targetList.splice(toIndex, 0, movedTask)

    // Update completion status if moving between lists
    if (fromCompleted !== isCompleted) {
      movedTask.completed = isCompleted
    }

    const updatedTasks = [...groupedTasks.value.incomplete, ...groupedTasks.value.completed]
    await taskManager.updateTasksOrder(props.day.name, updatedTasks)
    await loadTasks()
  } catch (err) {
    error.value = 'Failed to reorder tasks'
    console.error(err)
  }
}

onMounted(loadTasks);
watch(() => props.day, loadTasks);
</script>

<template>
  <div class="tasks">
    <header class="tasks-header">
      <h2>Tasks for {{ day.name }}</h2>
      <div class="task-stats">
        <span>Total: {{ tasks.length }}, Completed: {{ groupedTasks.completed.length }}, Remaining: {{
          groupedTasks.incomplete.length }} </span>
      </div>
      <div class="search-bar">
        <input v-model="searchQuery" type="search" placeholder="Search tasks..." class="search-input" />
      </div>
    </header>

    <div class="add-task">
      <div class="input-group">
        <input v-model="newTaskTitle" placeholder="Task title..." class="title-input" />
        <textarea v-model="newTaskDescription" placeholder="Task description..." class="description-input"></textarea>
      </div>
      <button @click="addTask" class="add-btn">Add Task</button>
    </div>

    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="!filteredTasks.length" class="no-tasks">
      {{ searchQuery ? 'No matching tasks found' : 'No tasks for this day' }}
    </div>

    <div v-else class="tasks-groups">
      <!-- Incomplete Tasks -->
      <section v-if="groupedTasks.incomplete.length" class="tasks-section">
        <h3 class="section-title">To Do ({{ groupedTasks.incomplete.length }})</h3>
        <TransitionGroup name="task-list" tag="ul" class="task-list">
          <li v-for="(task, index) in groupedTasks.incomplete" :key="task.id" draggable="true"
            @dragstart="handleDragStart($event, task, index, false)" @dragend="handleDragEnd"
            @dragover="handleDragOver($event, index, false)" @drop="handleDrop($event, index, false)">
            <div v-if="editingTask?.id === task.id" class="edit-form">
              <input v-model="editingTask.newTitle" class="edit-title" />
              <textarea v-model="editingTask.newDescription" class="edit-description"></textarea>
              <div class="edit-actions">
                <button @click="saveEdit" class="save-btn">Save</button>
                <button @click="editingTask = null" class="cancel-btn">Cancel</button>
              </div>
            </div>
            <div v-else class="task-content">
              <div class="task-header">
                <input type="checkbox" :checked="task.completed" @change="toggleTask(task.id)" />
                <span class="task-title">{{ task.title }}</span>
                <div class="task-actions">
                  <button @click="startEditing(task)" class="edit-btn">Edit</button>
                  <button @click="deleteTask(task.id)" class="delete-btn">×</button>
                </div>
              </div>
              <p v-if="task.description" class="task-description">{{ task.description }}</p>
            </div>
          </li>
        </TransitionGroup>
      </section>

      <!-- Completed Tasks -->
      <section v-if="groupedTasks.completed.length" class="tasks-section completed-section">
        <h3 class="section-title">Completed ({{ groupedTasks.completed.length }})</h3>
        <TransitionGroup name="task-list" tag="ul" class="task-list completed-list">
          <li v-for="(task, index) in groupedTasks.completed" :key="task.id" draggable="true"
            @dragstart="handleDragStart($event, task, index, true)" @dragend="handleDragEnd"
            @dragover="handleDragOver($event, index, true)" @drop="handleDrop($event, index, true)" class="completed">
            <div class="task-content">
              <div class="task-header">
                <input type="checkbox" :checked="task.completed" @change="toggleTask(task.id)" />
                <span class="task-title">{{ task.title }}</span>
                <div class="task-actions">
                  <button @click="deleteTask(task.id)" class="delete-btn">×</button>
                </div>
              </div>
              <p v-if="task.description" class="task-description">{{ task.description }}</p>
            </div>
          </li>
        </TransitionGroup>
      </section>
    </div>
  </div>
</template>

<style scoped>
.tasks {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow);
}

.tasks-header {
  margin-bottom: var(--spacing-xl);
}

.search-bar {
  flex: 1;
  max-width: 300px;
}

.search-input {
  background: var(--background);
  border: 1px solid var(--border);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-full);
}

.tasks-groups {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.tasks-section {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
}

.completed-section {
  opacity: 0.8;
}

.add-task {
  background: var(--background);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.title-input,
.description-input {
  padding: 0.8rem;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.title-input:focus,
.description-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.description-input {
  min-height: 80px;
  resize: vertical;
  max-height: 200px;
  width: 100%;
  box-sizing: border-box;
}

.add-btn {
  width: 100%;
  padding: 0.8rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-weight: 600;
}

.add-btn:hover {
  background: #43A047;
}

.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.task-list li {
  background: var(--background);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-sm);
  padding: 1rem;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
  cursor: grab;
}

.task-list li:hover {
  transform: translateX(var(--spacing-xs));
}

.task-list li:active {
  cursor: grabbing;
}

/* Add visual feedback for drag and drop */
.task-list li.dragging {
  opacity: 0.5;
  transform: scale(1.02);
  background: var(--surface-dark);
}

.task-list li.drag-over {
  border: 2px dashed var(--primary);
  transform: translateY(4px);
}

.task-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.task-title {
  flex: 1;
  font-weight: 500;
}

.task-description {
  margin-top: 0.5rem;
  margin-left: 1.5rem;
  color: #666;
  font-size: 0.9em;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  max-width: 100%;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-btn {
  background: var(--warning);
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn {
  background: var(--danger);
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.completed {
  opacity: 0.7;
}

.completed .task-title {
  text-decoration: line-through;
  color: var(--text-light);
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.edit-title,
.edit-description {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.edit-description {
  min-height: 60px;
  resize: vertical;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.save-btn,
.cancel-btn {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn {
  background: #4CAF50;
  color: white;
}

.cancel-btn {
  background: #9e9e9e;
  color: white;
}

.error {
  color: #ff4444;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #ffebee;
  border-radius: 4px;
}

.task-list-move {
  transition: transform 0.5s ease;
}

.task-list-enter-active,
.task-list-leave-active {
  transition: all 0.5s ease;
}

.task-list-enter-from,
.task-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
