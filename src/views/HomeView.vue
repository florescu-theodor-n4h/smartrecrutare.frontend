<script setup lang="ts">
import ComponentHomePage from '../components/ComponentHomePage.vue'
</script>

<template>
  <main>
    <ComponentHomePage>
      <template #sidebar> Sidebar navigatie. </template>
      Hello world.
    </ComponentHomePage>
  </main>
</template>
