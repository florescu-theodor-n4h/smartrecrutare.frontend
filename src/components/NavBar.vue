<template>
  <nav>
    <!-- SIDE NAV -->
    <nav class="sidebar">
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/dashboard">Dashboard</RouterLink>
      <RouterLink to="/jobs">Jobs</RouterLink>
      <RouterLink to="/candidates">Candidates</RouterLink>
    </nav>
    <AuthPill />
  </nav>
</template>

<script setup lang="ts">
import AuthPill from './AuthPill.vue'
</script>
