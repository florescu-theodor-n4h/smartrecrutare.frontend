<template>
  <section class="statistics-page">
    <header class="statistics-header">
      <div>
        <h1>{{ $t('statistics.title') }}</h1>
        <p>{{ $t('statistics.subtitle') }}</p>
      </div>
      <button class="refresh" @click="loadStatistics">{{ $t('statistics.refresh') }}</button>
    </header>

    <p v-if="loading" class="info">{{ $t('messages.loading') }}</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <div v-else class="cards">
      <article class="card">
        <h2>{{ $t('statistics.cards.matches') }}</h2>
        <p>{{ matchesCount }}</p>
      </article>
      <article class="card">
        <h2>{{ $t('statistics.cards.runs') }}</h2>
        <p>{{ runsCount }}</p>
      </article>
      <article class="card">
        <h2>{{ $t('statistics.cards.jobs') }}</h2>
        <p>{{ dashboardJobs }}</p>
      </article>
      <article class="card">
        <h2>{{ $t('statistics.cards.candidates') }}</h2>
        <p>{{ dashboardCandidates }}</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { analyticsApi, type AnalyticsDashboard } from '@/services/analyticsApi'

const { t } = useI18n()

const loading = ref(false)
const error = ref('')
const dashboard = ref<AnalyticsDashboard>({})
const matchesCount = ref(0)
const runsCount = ref(0)

function readCountFromPageLike(data: unknown): number {
  if (!data || typeof data !== 'object') {
    return 0
  }

  const page = data as Record<string, unknown>
  const directTotal =
    typeof page.totalElemente === 'number'
      ? page.totalElemente
      : typeof page.total === 'number'
        ? page.total
        : undefined

  if (typeof directTotal === 'number') {
    return directTotal
  }

  const list = Array.isArray(page.continut)
    ? page.continut
    : Array.isArray(page.content)
      ? page.content
      : Array.isArray(page.items)
        ? page.items
        : []

  return list.length
}

function pickNumber(payload: AnalyticsDashboard, keys: string[]): number {
  for (const key of keys) {
    const value = payload[key]
    if (typeof value === 'number') {
      return value
    }
  }

  return 0
}

const dashboardJobs = computed(() =>
  pickNumber(dashboard.value, ['jobs', 'totalJobs', 'numarJoburi']),
)
const dashboardCandidates = computed(() =>
  pickNumber(dashboard.value, ['candidates', 'totalCandidates', 'numarCandidati']),
)

async function loadStatistics(): Promise<void> {
  loading.value = true
  error.value = ''

  try {
    const [dashboardRes, matchesRes, runsRes] = await Promise.all([
      analyticsApi.getDashboard(),
      analyticsApi.listMatches(),
      analyticsApi.listRuns(),
    ])

    dashboard.value = dashboardRes.data
    matchesCount.value = readCountFromPageLike(matchesRes.data)
    runsCount.value = readCountFromPageLike(runsRes.data)
  } catch {
    error.value = t('statistics.loadError')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadStatistics()
})
</script>

<style scoped>
.statistics-page {
  display: grid;
  gap: 1rem;
}

.statistics-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.refresh {
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #f9fafb;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
}

.cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  background: #fff;
}

.card p {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.info {
  color: #6b7280;
}

.error {
  color: #b91c1c;
}

@media (max-width: 860px) {
  .cards {
    grid-template-columns: 1fr;
  }
}
</style>
