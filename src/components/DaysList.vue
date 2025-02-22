<script setup>
import { ref } from 'vue';
import Tasks from '@/components/DayTasks.vue';

const days = ref([
  { name: 'Thur', day: '5', isActive: false },
  { name: 'Fri', day: '6', isActive: false },
  { name: 'Sat', day: '7', isActive: false },
  { name: 'Sun', day: '8', isActive: false },
  { name: 'Mon', day: '9', isActive: false },
  { name: 'Tues', day: '10', isActive: false },
  { name: 'Wed', day: '11', isActive: false },
]);

// Define activeDay outside of onMounted
const activeDay = ref(null);

// Define handleDayClick as a regular function
const handleDayClick = (day) => {
  activeDay.value = day;
  // Update isActive state for all days
  days.value.forEach(d => {
    d.isActive = d === day;
  });
};
</script>

<template>
  <div class="days-container">
    <div class="day-item" v-for="day in days" :key="day.name">
      <button @click="handleDayClick(day)" :class="{ active: day.isActive }">
        <span>{{ day.day }}</span>
      </button>
      <p>{{ day.name }}</p>
    </div>
  </div>
  <div v-if="activeDay">
    <div class="active-day-container" v-if="activeDay">
      <div class="active-day-item">
        <Tasks :day="activeDay" />
      </div>
    </div>
  </div>
  <div id="no-active-day" v-else>
    <h1>No active day</h1>
    <p>Please select a day</p>
  </div>
</template>

<style scoped>
button {
  background-color: #ffb55f;
  border: 1px solid #a1733e;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  display: flex;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  background-color: #a1733e;
  color: white;
}

button.active {
  background-color: #a1733e;
  color: white;
  transform: scale(1.1);
}

.days-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
  margin-bottom: 1rem;
}

.day-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

p {
  margin: 0;
}

.active-day-container {
  margin-top: 2rem;
  padding: 1rem;
}

#no-active-day {
  display: flex;
  flex-direction: column;
  align-items: center;
}

#no-active-day h1 {
  font-size: 2rem;
  font-weight: bold;
}

#no-active-day p {
  font-size: 1.5rem;
  font-weight: bold;
}
</style>
