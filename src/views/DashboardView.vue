<template>
  <div class="container">
    <h1>{{ $t('nav.dashboard') }}</h1>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="isAuthenticated && user">
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
import { computed, inject, onMounted, ref } from 'vue'
import api from '../services/api'
import { useAuth0, type User } from '@auth0/auth0-vue'
import { AuthLoginKey, type AuthLoginService } from '@/services/auth.contract'
import { getAuthEnvironmentConfig, getPreferredAuthMode } from '@/services/auth'

const authConfig = getAuthEnvironmentConfig(import.meta.env)
const authMode = getPreferredAuthMode(authConfig)
const authLoginPlugin = inject<AuthLoginService | null>(AuthLoginKey, null)
const auth0 = authMode === 'auth0' ? useAuth0() : null

const user = computed<User | undefined>(() => auth0?.user.value)
const isAuthenticated = computed<boolean>(
  () => auth0?.isAuthenticated.value ?? authLoginPlugin?.isAuthenticated.value ?? false,
)
const isLoading = computed<boolean>(() => auth0?.isLoading.value ?? false)

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
