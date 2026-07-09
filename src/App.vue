<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useThemeStore } from '@/stores/theme.store'
const themeStore = useThemeStore()
import NavBar from '@/components/NavBar.vue'
import ApiStatusBar from '@/components/ApiStatusBar.vue'
import ChatbotAndroidWidget from '@/components/ChatbotAndroidWidget.vue'
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

    <footer class="legal-footer">
      <section>
        <h4>{{ $t('footer.companyTitle') }}</h4>
        <p>{{ $t('footer.companyDescription') }}</p>
      </section>
      <section>
        <h4>{{ $t('footer.legalTitle') }}</h4>
        <ul>
          <li>{{ $t('footer.terms') }}</li>
          <li>{{ $t('footer.privacy') }}</li>
          <li>{{ $t('footer.cookies') }}</li>
        </ul>
      </section>
      <section>
        <h4>{{ $t('footer.resourcesTitle') }}</h4>
        <ul>
          <li>{{ $t('footer.apiStatus') }}</li>
          <li>{{ $t('footer.support') }}</li>
          <li>{{ $t('footer.roadmap') }}</li>
        </ul>
      </section>
      <section>
        <h4>{{ $t('footer.contactTitle') }}</h4>
        <p>{{ $t('footer.contactValue') }}</p>
        <small>{{ $t('footer.rights', { year: new Date().getFullYear() }) }}</small>
      </section>
    </footer>

    <ChatbotAndroidWidget label="Open chatbot" />
    <ApiStatusBar />
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

.legal-footer {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  border-top: 1px solid var(--color-border);
  margin-top: 1rem;
  padding-top: 1rem;
}

.legal-footer h4 {
  margin: 0 0 0.5rem;
  font-size: 0.95rem;
}

.legal-footer p,
.legal-footer li,
.legal-footer small {
  color: var(--color-text);
  opacity: 0.85;
  font-size: 0.875rem;
}

.legal-footer ul {
  margin: 0;
  padding-left: 1rem;
}

@media (max-width: 860px) {
  .legal-footer {
    grid-template-columns: 1fr;
  }
}
</style>
