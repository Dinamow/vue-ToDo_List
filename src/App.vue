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
  <footer>
    <p>Copyright &copy; 2025 DINAMOW</p>
  </footer>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

img {
  border-radius: 50%;
}

header {
  line-height: 1.5;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

main {
  width: 100%;
  margin-top: 2rem;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

@media (min-width: 1024px) {
  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
