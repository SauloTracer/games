<script setup>
</script>

<template>
  <div>
    <a
      href="https://vitejs.dev"
      target="_blank"
    >
      <img
        src="
      /vite.svg"
        class="logo"
        alt="Vite logo"
      />
    </a>
    <div style="display: inline; vertical-align: super;">
      <nav id="menu">
        <router-link to="/">Home</router-link> |
        <router-link to="/sudoku">Sudoku</router-link>
      </nav>
    </div>
    <a
      href="https://vuejs.org/"
      target="_blank"
    >
      <img
        src="
    ./assets/vue.svg"
        class="logo vue"
        alt="Vue logo"
      />
    </a>
  </div>

  <router-view style="height: 80vh;" />
</template>

<style scoped>
.logo {
  height: 2em;
  padding: 0 1.5em 0 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

#menu {
  display: inline-block;
}
</style>
