<template>
  <div class="container">
    <h1>{{ $t('nav.dashboard') }}</h1>
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../services/api'

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
