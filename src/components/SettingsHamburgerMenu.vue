<template>
  <div class="settings-menu" ref="root">
    <button
      type="button"
      class="settings-trigger"
      :aria-label="t('nav.settings')"
      :aria-expanded="menuOpen"
      aria-haspopup="menu"
      @click="toggleMenu"
    >
      <span class="bars" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </span>
      <span class="trigger-label">{{ t('nav.settings') }}</span>
    </button>

    <div v-if="menuOpen" class="menu-panel" role="menu">
      <p class="menu-title">{{ t('nav.settings') }}</p>
      <RouterLink class="menu-link" to="/admin" role="menuitem" @click="closeMenu">
        {{ t('nav.admin') }}
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const menuOpen = ref(false)
const root = ref<HTMLElement | null>(null)

function toggleMenu(): void {
  menuOpen.value = !menuOpen.value
}

function closeMenu(): void {
  menuOpen.value = false
}

function onDocumentClick(event: MouseEvent): void {
  const target = event.target as Node | null
  if (!target || !root.value) {
    return
  }

  if (!root.value.contains(target)) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>

<style scoped>
.settings-menu {
  position: relative;
}

.settings-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  border: 1px solid var(--color-border, #c8d3e8);
  background: #fff;
  border-radius: 10px;
  padding: 0.45rem 0.75rem;
  cursor: pointer;
  color: var(--color-text, #111827);
}

.bars {
  display: inline-flex;
  flex-direction: column;
  gap: 3px;
}

.bars span {
  width: 16px;
  height: 2px;
  border-radius: 999px;
  background: currentColor;
}

.trigger-label {
  font-weight: 600;
}

.menu-panel {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  min-width: 220px;
  /*background: #fff;*/
  background: var(--bg, #fff);
  border: 1px solid var(--color-border, #d7dfef);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(20, 40, 80, 0.14);
  padding: 0.75rem;
  z-index: 30;
}

.menu-title {
  margin: 0 0 0.55rem;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7280;
}

.menu-link {
  display: block;
  padding: 0.5rem 0.6rem;
  border-radius: 8px;
  color: inherit;
  text-decoration: none;
}

.menu-link:hover {
  background: #f3f6fb;
}
</style>
