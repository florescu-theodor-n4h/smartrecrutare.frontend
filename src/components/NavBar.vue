<template>
  <div class="nav-wrap">
    <nav class="sidebar">
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/dashboard">{{ $t('nav.dashboard') }}</RouterLink>
      <RouterLink to="/jobs">{{ $t('nav.jobs') }}</RouterLink>
      <RouterLink to="/candidates">{{ $t('nav.candidates') }}</RouterLink>
      <RouterLink to="/chatbot">{{ $t('nav.chatbot') }}</RouterLink>
    </nav>
    <div class="actions">
      <NotificationBell />
      <AuthPill />
    </div>
  </div>
</template>

<script setup lang="ts">
import AuthPill from './AuthPill.vue'
import NotificationBell from '@/components/notifications/NotificationBell.vue'
</script>

<style scoped>
.nav-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.sidebar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

@media (max-width: 860px) {
  .nav-wrap {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
