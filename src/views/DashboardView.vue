<template>
  <div class="container">
    <h1>{{ $t('nav.dashboard') }}</h1>
    <div v-if="isLoading">{{ $t('messages.loading') }}</div>
    <div v-else class="dashboard-shell">
      <section class="profile-card" :class="{ 'guest-card': !isAuthenticated }">
        <h2>{{ isAuthenticated ? $t('dashboard.welcomeBack') : $t('dashboard.guestTitle') }}</h2>
        <p>{{ $t('dashboard.guestSummary') }}</p>
      </section>

      <div class="grid">
        <div class="card">
          <h2>{{ $t('dashboard.statusLabel') }}</h2>
          <p>{{ statsOverview }}</p>
        </div>
        <div class="card">
          <h2>{{ $t('dashboard.openJobs') }}</h2>
          <p>{{ openJobs }}</p>
        </div>
        <div class="card">
          <h2>{{ $t('dashboard.recentCandidates') }}</h2>
          <p>{{ recentCandidates }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../services/api'
import { AuthLoginKey, type AuthLoginService } from '@/services/auth.contract'

const { t } = useI18n()

/* Injectare serviciu de autentificare fara a arunca eroare daca lipseste */
const authLoginPlugin = inject<AuthLoginService | null>(AuthLoginKey, null)
const isAuthenticated = computed<boolean>(() => authLoginPlugin?.isAuthenticated.value ?? false)

const isLoading = ref(true)
const statsOverview = ref('')
const openJobs = ref(0)
const recentCandidates = ref(0)

async function load(): Promise<void> {
  isLoading.value = true
  try {
    const [jobsRes, candidatesRes] = await Promise.all([api.getJobs(), api.getCandidates()])
    openJobs.value = Array.isArray(jobsRes.data) ? jobsRes.data.length : 0
    recentCandidates.value = Array.isArray(candidatesRes.data)
      ? candidatesRes.data.slice(-5).length
      : 0
    statsOverview.value = t('dashboard.dataLoaded')
  } catch {
    statsOverview.value = t('dashboard.dataUnavailable')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void load()
})
</script>

<style scoped>
.dashboard-shell {
  display: grid;
  gap: 1rem;
}

.profile-card {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
}

.guest-card {
  background: #f8fafc;
}

.profile-card img {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
}

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
