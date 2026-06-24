<template>
  <div class="container">
    <header class="toolbar">
      <h1>{{ $t('nav.candidates') }}</h1>
      <button @click="openCreate" class="btn">{{ $t('actions.create') }}</button>
    </header>

    <div v-if="loading">{{ $t('messages.loading') }}</div>
    <div v-else>
      <table class="table">
        <thead>
          <tr>
            <th>{{ $t('candidates.name') }}</th>
            <th>{{ $t('candidates.email') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in candidates" :key="c.id">
            <td>{{ c.name }}</td>
            <td>{{ c.email }}</td>
            <td>
              <button @click="edit(c)" class="btn-small">{{ $t('actions.edit') }}</button>
              <button @click="remove(c)" class="btn-small danger">
                {{ $t('actions.delete') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="candidates.length === 0">{{ $t('candidates.noData') }}</div>
    </div>

    <div v-if="modalOpen" class="modal">
      <div class="modal-content">
        <h3>
          {{ editing.id ? $t('actions.edit') : $t('actions.create') }} {{ $t('nav.candidates') }}
        </h3>
        <label>{{ $t('candidates.name') }}</label>
        <input v-model="editing.name" />
        <label>{{ $t('candidates.email') }}</label>
        <input v-model="editing.email" />
        <label>Phone</label>
        <input v-model="editing.phone" />
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
import api, { type Candidate } from '../services/api'
import type { Ref } from 'vue'

const candidates = ref<Candidate[]>([])
const loading = ref(false)
const modalOpen = ref(false)
const editing: Ref<Partial<Candidate>> = ref({})

async function load() {
  loading.value = true
  try {
    const res = await api.getCandidates()
    candidates.value = Array.isArray(res.data) ? res.data : []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = { name: '', email: '', phone: '' } as Partial<Candidate>
  modalOpen.value = true
}

function edit(item: Candidate) {
  editing.value = { ...item } as Partial<Candidate>
  modalOpen.value = true
}

function close() {
  modalOpen.value = false
}

async function save() {
  try {
    if (editing.value.id) {
      await api.updateCandidate(editing.value.id, editing.value as Candidate)
    } else {
      const newCandidate = editing.value as Candidate
      await api.createCandidate(newCandidate)
    }
    await load()
    close()
  } catch (e) {
    console.error(e)
  }
}

async function remove(item: Candidate) {
  if (!confirm('Delete candidate?')) return
  if (!item.id) return
  try {
    await api.deleteCandidate(item.id)
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
