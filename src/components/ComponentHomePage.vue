<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">
/* Se poate utiliza:
<ComponentHomePage titlu="Home">
  <template #imagine>
    <LogoAnimatie />
  </template>

  Continut
</ComponentHomePage>
*/
// aici se importa toate imaginile, se definesc variabilele
import { onMounted, computed, useSlots } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const DEFAULT_BODY = t('messages.error')

// se definesc proprietatiile
const proprietati = defineProps({
  titlu: { type: String, default: 'Pagina Acasa' },
  urlImagine: { type: URL, default: new URL('https://proicons.com/icon/3392.svg') },
  caption: { type: String, default: 'Pagina Web proiect practica 2026' },
})

function computeImagine(): string {
  if (!proprietati.urlImagine) return String()
  return proprietati.urlImagine.href
}

const imgRezolvata = computed(computeImagine)

function doOnMounted() {
  document.title = proprietati.titlu
}
onMounted(doOnMounted)
</script>

<!-- Template pentru pagini principale din aplicatie -->
<template>
  <div class="card-layout">
    <!-- <ItemHomePage>
  <template #icon>
    <img src="https://proicons.com/icon/3392.svg" alt="Home" width="18" height="18" />

    < ! -- Se importa imaginea de pe site-ul proicons.com - licenta open-source- ->
  </template>
  < !- - </ItemHomePage> -->

    <header class="page-header">
      <figure class="card-header">
        <slot name="image">
          <img :src="imgRezolvata" :alt="'Logo ' + proprietati.titlu" />
        </slot>
        <figcaption>
          <em>{{ proprietati.caption }}</em>
        </figcaption>
      </figure>

      <h1>
        <slot name="title" class="title">
          {{ proprietati.titlu }}
        </slot>
      </h1>
    </header>

    <div class="card-content">
      <aside v-if="$slots.sidebar" class="card-right-sidebar">
        <slot name="sidebar" />
      </aside>

      <!-- Se insereaza Body-ul paginii. -->
      <main class="card-main" name="continut_pagina">
        <slot> {{ DEFAULT_BODY }}; </slot>
      </main>
    </div>
  </div>
</template>

<style scoped>
.item {
  margin-top: 2rem;
  display: flex;
  position: relative;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  background: var(--card-bg);
  color: var(--text);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  border-radius: 12px;
}

.page-header .card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-header img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  border-radius: 10px;
}

.page-header h1 {
  margin: 0;
  font-size: 1.6rem;
  line-height: 1.2;
}

.page-header figcaption em {
  color: var(--muted);
  font-style: normal;
}

.card-content {
  background: var(--card-bg);
  color: var(--text);
  display: flex;
  gap: 1.5rem;
  padding: 1.25rem;
  border-radius: 12px;
  align-items: flex-start;
}

.card-main {
  flex: 1;
  min-width: 0;
  color: var(--text);
}

.card-right-sidebar {
  width: 280px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .card-content {
    flex-direction: column;
  }

  .card-right-sidebar {
    width: 100%;
  }
}

body {
  background: var(--bg);
  color: var(--text);
}
</style>
