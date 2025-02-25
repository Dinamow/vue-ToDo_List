<script setup>
import HelloWorld from './components/HelloWorld.vue'
import days from './components/DaysList.vue'
</script>

<template>
  <div class="container">
    <header>
      <img alt="Vue logo" class="logo" src="./assets/حمبوله.jpg" width="125" height="125" />
      <div class="wrapper">
        <HelloWorld msg="Good evening! Abdo" />
      </div>
    </header>

    <main>
      <days />
    </main>
  </div>
</template>

<style scoped>
.container {
  background: var(--surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

header {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  padding: var(--spacing-xl);
  color: white;
}

.logo {
  border: 3px solid white;
  box-shadow: var(--shadow);
}

main {
  padding: var(--spacing-xl);
}

img {
  border-radius: 50%;
}

header {
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

@media (min-width: 1024px) {
  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
