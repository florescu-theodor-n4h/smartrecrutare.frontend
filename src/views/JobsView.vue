<template>
  <div class="container">
    <header class="toolbar">
      <h1>{{ $t('nav.jobs') }}</h1>
      <button @click="openCreate" class="btn">{{ $t('actions.create') }}</button>
    </header>

    <div v-if="loading">{{ $t('messages.loading') }}</div>
    <div v-else>
      <table class="table">
        <thead>
          <tr>
            <th>{{ $t('jobs.titlu') }}</th>
            <th>{{ $t('jobs.locatie') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="job in jobs" :key="job.id">
            <td>{{ job.titlu }}</td>
            <td>{{ job.locatie }}</td>
            <td>
              <button @click="edit(job)" class="btn-small">{{ $t('actions.edit') }}</button>
              <button @click="remove(job)" class="btn-small danger">
                {{ $t('actions.delete') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="jobs.length === 0">{{ $t('jobs.noData') }}</div>
    </div>

    <div v-if="modalOpen" class="modal">
      <div class="modal-content">
        <h3>{{ editing.id ? $t('actions.edit') : $t('actions.create') }} {{ $t('nav.jobs') }}</h3>
        <label>{{ $t('jobs.title') }}</label>
        <input v-model="editing.titlu" />
        <label>{{ $t('jobs.location') }}</label>
        <input v-model="editing.locatie" />
        <label>{{ $t('jobs.description') }}</label>
        <textarea v-model="editing.descriere"></textarea>
        <label>Employer ID</label>
        <input v-model.number="editing.employerId" type="number" min="1" />
        <div class="modal-actions">
          <button @click="save" class="btn">{{ $t('actions.save') }}</button>
          <button @click="close" class="btn-ghost">{{ $t('actions.cancel') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api, { Job } from '../services/api'
import type { Ref } from 'vue'

const jobs = ref<Job[]>([])
const loading = ref(false)
const modalOpen = ref(false)
const editing: Ref<Partial<Job>> = ref({})

async function load() {
  loading.value = true
  try {
    const res = await api.getJobs()
    jobs.value = Array.isArray(res.data) ? res.data : []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = new Job() as Partial<Job>
  editing.value.activ = true
  modalOpen.value = true
}

function edit(job: Job) {
  editing.value = { ...job } as Partial<Job>
  modalOpen.value = true
}

function close() {
  modalOpen.value = false
}

async function save() {
  try {
    if (!editing.value.employerId) {
      throw new Error('Employer id is required')
    }

    if (editing.value.id) {
      await api.updateJob(editing.value.id, editing.value as Job)
    } else {
      const newJob = editing.value as Job
      await api.createJob(newJob)
    }
    await load()
    close()
  } catch (e) {
    console.error(e)
  }
}

async function remove(job: Job) {
  if (!confirm('Delete job?')) return
  if (!job.id) return
  try {
    await api.deleteJob(job.id)
    await load()
  } catch (e) {
    console.error(e)
  }
}

onMounted(load)
</script>

<style scoped>
.container {
  padding: 1rem;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.btn {
  background: #0b5cff;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}
.btn-small {
  padding: 0.25rem 0.5rem;
  margin-right: 0.5rem;
}
.danger {
  background: #ef4444;
  color: white;
}
.table {
  width: 100%;
  border-collapse: collapse;
}
.table th,
.table td {
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  width: 600px;
}
.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
}
</style>
