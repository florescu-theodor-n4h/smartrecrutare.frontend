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
      <aside v-if="$slots.sidebar" class="card-sidebar">
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
}
.page-header,
.card-content {
  background: var(--card-bg);
  color: var(--text);
}

.page-header figcaption em {
  color: var(--muted);
}

.card-main {
  color: var(--text);
}

body {
  background: var(--bg);
  color: var(--text);
}
</style>
