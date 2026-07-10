<template>
  <footer class="api-status" role="status" aria-live="polite">
    <span class="label">API:</span>
    <span class="value">{{ apiBaseUrl }}</span>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getActiveApiBaseUrl } from '@/services/httpClient'

const apiBaseUrl = computed(() => getActiveApiBaseUrl())
</script>

<style scoped>
.api-status {
  padding: 0.4rem 0.9rem;
  /*display: flex;
  gap: 0.45rem;*/
  align-items: center;
  justify-content: center;
  border-top: 1px solid
    color-mix(in srgb, #a7ac9d 55%, color-mix(in srgb, var(--card-bg) 60%, var(--bg)));
  background: rgba(8, 17, 36, 0.92);
  color: #d8e7ff;
  font-size: 0.82rem;
  /* backdrop-filter: blur(6px);*/
}

.label {
  color: #7bc8ff;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.value {
  font-family: 'Courier New', Courier, monospace;
}
</style>
