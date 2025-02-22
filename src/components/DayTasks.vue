<script setup>
import { ref, onMounted, watch } from 'vue';
import { tasksManager } from '@/utils/tasks';

const props = defineProps({
  day: {
    type: Object,
    required: true
  }
});

const tasks = ref([]);

const loadTasks = async () => {
  try {
    const dayTasks = await tasksManager.getTasksObjectStore(props.day.name.toLowerCase());
    tasks.value = dayTasks || [];
  } catch (error) {
    console.error('Error loading tasks:', error);
    tasks.value = [];
  }
};

onMounted(loadTasks);

watch(() => props.day, loadTasks);
</script>

<template>
  <div class="tasks">
    <h2>Tasks for {{ day.name }}</h2>
    <div v-if="tasks.length === 0" class="no-tasks">
      No tasks for this day
    </div>
    <ul v-else>
      <li v-for="task in tasks" :key="task.id">
        {{ task.title }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.tasks {
  padding: 1rem;
}

.no-tasks {
  text-align: center;
  color: #666;
  padding: 1rem;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}
</style>
