<script setup lang="ts">
import { RouterView } from 'vue-router'
// import HelloWorld from './components/HelloWorld.vue'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ref } from 'vue'
import { useThemeStore } from '@/stores/theme.store'
const themeStore = useThemeStore()
import NavBar from './components/NavBar.vue'
</script>

<template id="wrapper">
  <!--
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header>
-->

  <div id="main_spa_div" :class="{ dark: themeStore.dark }">
    <!-- TOP BAR -->
    <header class="topbar">
      <div class="left">{{ $t('appTitle') }}</div>

      <div class="right">
        <button @click="themeStore.toggle()">
          {{ themeStore.dark ? 'Light Mode' : 'Dark Mode' }}
        </button>
      </div>
    </header>

    <div class="layout">
      <!-- CONTENT -->
      <main class="content">
        <NavBar></NavBar>
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
