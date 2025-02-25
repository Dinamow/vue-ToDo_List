<script setup>
import { ref, onMounted } from 'vue';
import Tasks from '@/components/DayTasks.vue';

const today = new Date().getDate();
console.log(today);
const days = ref([
  { name: 'Thur', day: '24', isActive: false, isToday: 24 === today },
  { name: 'Fri', day: '25', isActive: false, isToday: 25 === today },
  { name: 'Sat', day: '26', isActive: false, isToday: 26 === today },
  { name: 'Sun', day: '27', isActive: false, isToday: 27 === today },
  { name: 'Mon', day: '28', isActive: false, isToday: 28 === today },
  { name: 'Tues', day: '29', isActive: false, isToday: 29 === today },
  { name: 'Wed', day: '30', isActive: false, isToday: 30 === today },
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

// Auto-select today's date on mount
onMounted(() => {
  const todayDay = days.value.find(d => d.isToday);
  if (todayDay) handleDayClick(todayDay);
});
</script>

<template>
  <div class="calendar-container">
    <div class="days-container">
      <div class="day-item" v-for="day in days" :key="day.name">
        <button @click="handleDayClick(day)" :class="{
          'active': day.isActive,
          'today': day.isToday
        }">
          <div class="day-content">
            <span class="day-number">{{ day.day }}</span>
            <span class="day-name">{{ day.name }}</span>
          </div>
        </button>
      </div>
    </div>
    <div v-if="activeDay" class="active-day-container">
      <div class="active-day-item">
        <Tasks :day="activeDay" />
      </div>
    </div>
    <div id="no-active-day" v-else>
      <h1>No active day</h1>
      <p>Please select a day</p>
    </div>
  </div>
</template>

<style scoped>
.calendar-container {
  width: 100%;
}

.days-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow);
  margin-bottom: var(--spacing-xl);
  overflow-x: auto;
}

.day-item {
  flex: 1;
  min-width: 80px;
}

.day-item button {
  width: 100%;
  height: 70px;
  background: linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 0.5rem;
  cursor: pointer;
}

.day-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.day-number {
  font-size: 1.5rem;
  font-weight: 600;
}

.day-name {
  font-size: 0.875rem;
  opacity: 0.9;
}

.day-item button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
}

.day-item button.active {
  background: var(--primary-dark);
  transform: scale(1.05);
  box-shadow: var(--shadow-lg);
}

.day-item button.today {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: black;
}

.day-item button.today:hover {
  background: linear-gradient(135deg, #FFD700 0%, #FFD700 100%);
}

#no-active-day {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-light);
  background: var(--surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}

#no-active-day h1 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--primary);
}

.active-day-container {
  margin-top: var(--spacing-lg);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .days-container {
    padding: var(--spacing-sm);
    gap: 0.25rem;
  }

  .day-item {
    min-width: 60px;
  }

  .day-item button {
    height: 60px;
  }

  .day-number {
    font-size: 1.25rem;
  }

  .day-name {
    font-size: 0.75rem;
  }
}
</style>
