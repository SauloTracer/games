<script setup>
import { ref } from 'vue'
import AdSense from './components/AdSense.vue';
import { useIsMobileStore } from './stores/isMobile';

const drawer = ref(false);
const isMobileStore = useIsMobileStore();

const handleResize = () => {
  isMobileStore.setIsMobile(window.innerWidth < 768); // Ajuste o valor conforme necessário
};

window.addEventListener('resize', handleResize);
handleResize(); // Chame a função inicialmente para definir o valor correto

</script>

<template>
  <v-app>
    <!-- <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title>Meu Aplicativo</v-app-bar-title>
    </v-app-bar> -->
    <v-icon @click="drawer = !drawer">mdi-menu</v-icon>

    <v-navigation-drawer
      v-model="drawer"
      app
    >
      <v-list dense>
        <v-list-item>
          <v-list-item-title>
            <router-link to="/">Home</router-link>
          </v-list-item-title>
        </v-list-item>

        <v-list-item>
          <v-list-item-title>
            <router-link to="/sudoku">Sudoku</router-link>
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <div>
      <AdSense adUnit="top" />
      <div style="display: flex;">
        <AdSense adUnit="left" />
        <div>
          <router-view />
        </div>
        <AdSense adUnit="right" />
      </div>
    </div>
  </v-app>
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
