<template>
  <div class="container">
    <h1>{{ $t('nav.dashboard') }}</h1>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="isAuthenticated">
      <h1>Welcome, {{ user.name }}</h1>
      <img :src="user.picture" :alt="user.name" />
      <p>{{ user.email }}</p>
      <pre>{{ JSON.stringify(user, null, 2) }}</pre>
      <div class="grid">
        <div class="card">
          <h2>Overview</h2>
          <p>{{ statsOverview }}</p>
        </div>
        <div class="card">
          <h2>Open Jobs</h2>
          <p>{{ openJobs }}</p>
        </div>
        <div class="card">
          <h2>Recent Candidates</h2>
          <p>{{ recentCandidates }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../services/api'
import { useAuth0 } from '@auth0/auth0-vue'
const { user, isAuthenticated, isLoading } = useAuth0()

const statsOverview = ref('')
const openJobs = ref(0)
const recentCandidates = ref(0)

async function load() {
  try {
    const [jobsRes, candidatesRes] = await Promise.all([api.getJobs(), api.getCandidates()])
    openJobs.value = Array.isArray(jobsRes.data) ? jobsRes.data.length : 0
    recentCandidates.value = Array.isArray(candidatesRes.data)
      ? candidatesRes.data.slice(-5).length
      : 0
    statsOverview.value = 'Data loaded'
  } catch {
    statsOverview.value = 'Unavailable'
  }
}

onMounted(load)
</script>

<style scoped>
.grid {
  display: flex;
  gap: 1rem;
}
.card {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  flex: 1;
}
.container {
  padding: 1rem;
}
</style>
