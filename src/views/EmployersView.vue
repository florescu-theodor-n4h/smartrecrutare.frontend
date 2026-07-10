<template>
  <div class="container">
    <header class="toolbar">
      <h1>{{ $t('nav.employers') }}</h1>
      <button @click="openCreate" class="btn">{{ $t('actions.create') }}</button>
    </header>

    <p v-if="loading" class="state-msg">{{ $t('messages.loading') }}</p>
    <p v-else-if="error" class="state-msg error">{{ error }}</p>

    <template v-else>
      <table class="table">
        <thead>
          <tr>
            <th>{{ $t('employers.nume') }}</th>
            <th>{{ $t('employers.denumireLegala') }}</th>
            <th>{{ $t('employers.status') }}</th>
            <th>{{ $t('employers.emailContact') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="emp in employers" :key="emp.id">
            <td>{{ emp.nume }}</td>
            <td>{{ emp.denumireLegala ?? '-' }}</td>
            <td>
              <span :class="['badge', statusClass(emp.status)]">{{ emp.status ?? '-' }}</span>
            </td>
            <td>{{ emp.emailContact ?? '-' }}</td>
            <td class="actions-cell">
              <button @click="edit(emp)" class="btn-small">{{ $t('actions.edit') }}</button>
              <button @click="remove(emp)" class="btn-small danger">
                {{ $t('actions.delete') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="employers.length === 0" class="state-msg">{{ $t('employers.noData') }}</p>
    </template>

    <!-- Paginare -->
    <div v-if="totalPagini > 1" class="pagination">
      <button :disabled="pagina === 0" @click="changePage(pagina - 1)" class="btn-ghost">
        &laquo;
      </button>
      <span>{{ pagina + 1 }} / {{ totalPagini }}</span>
      <button
        :disabled="pagina + 1 >= totalPagini"
        @click="changePage(pagina + 1)"
        class="btn-ghost"
      >
        &raquo;
      </button>
    </div>

    <!-- Modal creare / editare -->
    <div v-if="modalOpen" class="modal" @click.self="close">
      <div class="modal-content">
        <h3>
          {{ editing.id ? $t('actions.edit') : $t('actions.create') }}
          {{ $t('nav.employers') }}
        </h3>

        <label>{{ $t('employers.nume') }} *</label>
        <input v-model="editing.nume" />

        <label>{{ $t('employers.denumireLegala') }}</label>
        <input v-model="editing.denumireLegala" />

        <label>{{ $t('employers.status') }}</label>
        <select v-model="editing.status">
          <option value="">-</option>
          <option value="ACTIV">ACTIV</option>
          <option value="INACTIV">INACTIV</option>
          <option value="SUSPENDAT">SUSPENDAT</option>
          <option value="IN_VERIFICARE">IN_VERIFICARE</option>
        </select>

        <label>{{ $t('employers.codFiscal') }}</label>
        <input v-model="editing.codFiscal" />

        <label>{{ $t('employers.website') }}</label>
        <input v-model="editing.website" type="url" />

        <label>{{ $t('employers.adresa') }}</label>
        <input v-model="editing.adresa" />

        <label>{{ $t('employers.emailContact') }}</label>
        <input v-model="editing.emailContact" type="email" />

        <label>{{ $t('employers.telefonContact') }}</label>
        <input v-model="editing.telefonContact" />

        <p v-if="modalError" class="state-msg error">{{ modalError }}</p>

        <div class="modal-actions">
          <button @click="save" class="btn" :disabled="saving">{{ $t('actions.save') }}</button>
          <button @click="close" class="btn-ghost">{{ $t('actions.cancel') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Ref } from 'vue'
import {
  employersApi,
  type Employer,
  type EmployerCreateRequest,
  type EmployerStatus,
} from '@/services/employersApi'

const { t } = useI18n()

/* --- stare lista --- */
const employers = ref<Employer[]>([])
const loading = ref(false)
const error = ref('')
const pagina = ref(0)
const totalPagini = ref(1)
const PAGE_SIZE = 20

/* --- stare modal --- */
const modalOpen = ref(false)
const editing: Ref<Partial<Employer>> = ref({})
const saving = ref(false)
const modalError = ref('')

/* --- utilitare afisare badge status --- */
function statusClass(status: EmployerStatus | undefined): string {
  switch (status) {
    case 'ACTIV':
      return 'badge-green'
    case 'INACTIV':
      return 'badge-gray'
    case 'SUSPENDAT':
      return 'badge-red'
    case 'IN_VERIFICARE':
      return 'badge-yellow'
    default:
      return 'badge-gray'
  }
}

/* --- incarcare lista angajatori cu paginare --- */
async function load(page = 0): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    const res = await employersApi.listEmployers({ page, size: PAGE_SIZE })
    const data = res.data
    const continut = Array.isArray(data.continut)
      ? data.continut
      : Array.isArray(data.content)
        ? data.content
        : []
    employers.value = continut
    pagina.value = typeof data.pagina === 'number' ? data.pagina : page
    totalPagini.value = typeof data.totalPagini === 'number' ? data.totalPagini : 1
  } catch {
    error.value = t('messages.error')
  } finally {
    loading.value = false
  }
}

function changePage(page: number): void {
  void load(page)
}

/* --- deschide modal creare --- */
function openCreate(): void {
  editing.value = {}
  modalError.value = ''
  modalOpen.value = true
}

/* --- deschide modal editare --- */
function edit(emp: Employer): void {
  editing.value = { ...emp }
  modalError.value = ''
  modalOpen.value = true
}

function close(): void {
  modalOpen.value = false
}

/* --- salvare creare sau actualizare angajator --- */
async function save(): Promise<void> {
  const nume = editing.value.nume?.trim()
  if (!nume) {
    modalError.value = t('employers.numeRequired')
    return
  }
  saving.value = true
  modalError.value = ''
  try {
    if (editing.value.id) {
      await employersApi.updateEmployer(editing.value.id, {
        nume,
        denumireLegala: editing.value.denumireLegala,
        status: editing.value.status as EmployerStatus | undefined,
        codFiscal: editing.value.codFiscal,
        website: editing.value.website,
        adresa: editing.value.adresa,
        emailContact: editing.value.emailContact,
        telefonContact: editing.value.telefonContact,
        versiune: editing.value.versiune,
      })
    } else {
      const req: EmployerCreateRequest = {
        nume,
        denumireLegala: editing.value.denumireLegala,
        status: editing.value.status as EmployerStatus | undefined,
        codFiscal: editing.value.codFiscal,
        website: editing.value.website,
        adresa: editing.value.adresa,
        emailContact: editing.value.emailContact,
        telefonContact: editing.value.telefonContact,
      }
      await employersApi.createEmployer(req)
    }
    await load(pagina.value)
    close()
  } catch {
    modalError.value = t('messages.error')
  } finally {
    saving.value = false
  }
}

/* --- stergere angajator dupa confirmare --- */
async function remove(emp: Employer): Promise<void> {
  if (!emp.id) return
  if (!confirm(t('employers.confirmDelete'))) return
  error.value = ''
  try {
    await employersApi.deleteEmployer(emp.id)
    await load(pagina.value)
  } catch {
    error.value = t('messages.error')
  }
}

onMounted(() => {
  void load()
})
</script>

<!-- se adauga stilul comun de modal-->
<style scoped src="@/assets/shared_popup_modal.css"></style>
<style scoped>
.container {
  padding: 1rem;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.state-msg {
  margin: 1rem 0;
}

.error {
  color: #ef4444;
}

.btn {
  background: #0b5cff;
  color: #fff;
  border: 0;
  padding: 0.45rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn-small {
  border: 0;
  padding: 0.25rem 0.55rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  background: #e5e7eb;
  color: #111;
  margin-right: 0.35rem;
}

.btn-ghost {
  background: transparent;
  border: 1px solid var(--color-border, #d1d5db);
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
}

.danger {
  background: #ef4444;
  color: #fff;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.table th,
.table td {
  text-align: left;
  padding: 0.55rem 0.75rem;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
}

.table th {
  font-weight: 600;
  background: var(--card-bg, #f9fafb);
}

.actions-cell {
  white-space: nowrap;
}

/* Badge culori status */
.badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-green {
  background: #d1fae5;
  color: #065f46;
}

.badge-gray {
  background: #e5e7eb;
  color: #374151;
}

.badge-red {
  background: #fee2e2;
  color: #991b1b;
}

.badge-yellow {
  background: #fef3c7;
  color: #92400e;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  font-size: 0.9rem;
}
</style>
