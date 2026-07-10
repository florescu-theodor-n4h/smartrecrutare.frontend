<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme.store'
const themeStore = useThemeStore()
import NavBar from '@/components/NavBar.vue'
import ApiStatusBar from '@/components/ApiStatusBar.vue'
import ChatbotAndroidWidget from '@/components/ChatbotAndroidWidget.vue'
const isDev = import.meta.env.DEV

const { locale } = useI18n()

function setLocale(nextLocale: string): void {
  locale.value = nextLocale
}
</script>

<template>
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

  <div
    style="min-height: 100vh; display: flex; flex-direction: column"
    id="main_spa_div"
    :class="{ dark: themeStore.dark }"
  >
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
      <main class="content" style="flex: 1">
        <NavBar></NavBar>
        <RouterView />
      </main>
    </div>

    <!-- se adauga div-ul ce contine cele doua footere -->
    <div id="footers-cont">
      <footer class="footer-primary legal-footer">
        <section>
          <h4>{{ $t('footer.companyTitle') }}</h4>
          <p>{{ $t('footer.companyDescription') }}</p>
        </section>
        <section>
          <h4>{{ $t('footer.legalTitle') }}</h4>
          <ul>
            <li>
              <RouterLink to="/terms">{{ $t('footer.terms') }}</RouterLink>
            </li>
            <li>
              <RouterLink to="/privacy">{{ $t('footer.privacy') }}</RouterLink>
            </li>
            <li>
              <RouterLink to="/cookies">{{ $t('footer.cookies') }}</RouterLink>
            </li>
          </ul>
        </section>
        <section>
          <h4>{{ $t('footer.resourcesTitle') }}</h4>
          <ul>
            <li>
              <RouterLink to="/statistics">{{ $t('footer.apiStatus') }}</RouterLink>
            </li>
            <li>
              <RouterLink to="/support">{{ $t('footer.support') }}</RouterLink>
            </li>
            <li>
              <RouterLink to="/roadmap">{{ $t('footer.roadmap') }}</RouterLink>
            </li>
          </ul>
        </section>
        <section>
          <h4>{{ $t('footer.languageTitle') }}</h4>
          <label class="language-toggle" :for="'footer-language-select'">
            <span>{{ $t('footer.languageLabel') }}</span>
            <select
              id="footer-language-select"
              :value="locale"
              @change="setLocale(($event.target as HTMLSelectElement).value)"
            >
              <option value="en">{{ $t('footer.languages.en') }}</option>
              <option value="ro">{{ $t('footer.languages.ro') }}</option>
            </select>
          </label>
          <p>{{ $t('footer.contactValue') }}</p>
          <small>{{ $t('footer.rights', { year: new Date().getFullYear() }) }}</small>
        </section>
      </footer>

      <ApiStatusBar class="footer-secondary" v-if="isDev" />
    </div>

    <ChatbotAndroidWidget label="Open chatbot" />
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

#footers-cont {
  /*position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;*/
  position: static;
  width: 100%;
  margin-top: auto;
  border-top: 1px solid var(--color-border);
  border-top: 1px solid var(--color-border);
}

.footer-primary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.footer-secondary {
  display: grid;
  gap: 0.45rem;
  margin-top: 0.75rem;
}

@media (max-width: 700px) {
  .footer-primary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
  }
}

@media (max-width: 420px) {
  .footer-primary {
    grid-template-columns: 1fr;
  }
}

.legal-footer {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;

  padding: 0.4rem 0.9rem;
  /*display: grid;
  gap: 0.45rem; /*
  align-items: center;
  justify-content: center;*/
  /*border-top: 1px solid #cdd8ea;*/
  /*background: rgba(8, 17, 36, 0.92);*/
  /*color: #d8e7ff;*/
  font-size: 0.82rem;
  /*backdrop-filter: blur(6px);*/
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

.legal-footer a {
  color: inherit;
}

.language-toggle {
  display: grid;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
}

.language-toggle select {
  width: 100%;
  max-width: 12rem;
  padding: 0.45rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--color-text);
}

@media (max-width: 860px) {
  .legal-footer {
    grid-template-columns: 1fr;
  }
}
</style>
